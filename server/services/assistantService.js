const Worker = require('../models/Worker');
const Service = require('../models/Service');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function compact(obj) {
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(compact);
  if (typeof obj !== 'object') return obj;
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    out[k] = compact(v);
  }
  return out;
}

function sanitizeWorker(worker) {
  const obj = worker.toObject ? worker.toObject() : worker;
  return compact({
    id: String(obj._id),
    name: obj.userId?.name,
    primarySkill: obj.primarySkill,
    skills: obj.skills,
    rating: obj.rating,
    totalRatings: obj.totalRatings,
    city: obj.location?.city,
    address: obj.location?.address,
    availability: obj.availability,
    startingPrice: obj.startingPrice,
    experience: obj.experience,
    completedJobs: obj.completedJobs,
    verificationStatus: obj.verificationStatus,
    cooperativeName: obj.cooperativeName
  });
}

function sanitizeService(service) {
  const obj = service.toObject ? service.toObject() : service;
  return compact({
    name: obj.name,
    category: obj.category,
    description: obj.description,
    basePrice: obj.basePrice
  });
}

function cleanHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-12)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 2000)
    }));
}

async function callOpenRouter({ messages, json = false, temperature = 0.3 }) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    const err = new Error('AI_NOT_CONFIGURED');
    err.code = 'AI_NOT_CONFIGURED';
    throw err;
  }

  const body = {
    model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
    messages,
    temperature
  };
  if (json) body.response_format = { type: 'json_object' };

  const res = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:5173',
      'X-Title': 'CoopGig'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const err = new Error('AI_PROVIDER_ERROR');
    err.code = 'AI_PROVIDER_ERROR';
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    const err = new Error('AI_EMPTY_RESPONSE');
    err.code = 'AI_EMPTY_RESPONSE';
    throw err;
  }
  return content;
}

function parseJson(text) {
  try {
    const trimmed = String(text).trim();
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(trimmed.slice(start, end + 1));
  } catch {
    return null;
  }
}

async function searchWorkers({ skill, city }) {
  const query = {};
  if (skill) {
    query.$or = [
      { skills: { $regex: skill, $options: 'i' } },
      { primarySkill: { $regex: skill, $options: 'i' } }
    ];
  }
  if (city) {
    query['location.city'] = { $regex: city, $options: 'i' };
  }

  const workers = await Worker.find(query).populate('userId', 'name').limit(8);
  return workers.map(sanitizeWorker);
}

async function findServices({ skill }) {
  const query = { isActive: true };
  if (skill) {
    query.$or = [
      { name: { $regex: skill, $options: 'i' } },
      { category: { $regex: skill, $options: 'i' } },
      { description: { $regex: skill, $options: 'i' } }
    ];
  }
  const services = await Service.find(query).sort({ popularity: -1 }).limit(6);
  return services.map(sanitizeService);
}

function buildAction({ parsed, workers, user }) {
  const loggedIn = Boolean(user);
  const isCustomer = user?.role === 'customer';

  if (parsed.bookingRequested && workers[0]?.id) {
    if (!loggedIn) {
      return { label: 'Log In to Book', to: '/login' };
    }
    if (isCustomer) {
      return { label: 'Book Worker', to: `/book/${workers[0].id}` };
    }
  }

  if (parsed.skill && (workers.length > 0 || parsed.intent === 'search_workers')) {
    const params = new URLSearchParams();
    params.set('skill', parsed.skill);
    if (parsed.city) params.set('city', parsed.city);
    if (!loggedIn) {
      return { label: 'Log In to View Workers', to: '/login?from=search' };
    }
    if (isCustomer) {
      return { label: 'View Workers', to: `/workers?${params.toString()}` };
    }
  }

  return null;
}

async function runAssistant({ message, history, user }) {
  const services = await Service.find({ isActive: true }).select('name category description basePrice').sort({ popularity: -1 });
  const serviceCatalog = services.map(sanitizeService);
  const userCity = user?.location?.city || null;
  const loggedIn = Boolean(user);
  const conversation = cleanHistory(history);

  const extractPrompt = `You extract booking/search intent for CoopGig, a cooperative gig-work platform in India.
Return JSON only with this shape:
{
  "intent": "search_workers" | "pricing" | "booking_help" | "general" | "clarify",
  "skill": string | null,
  "city": string | null,
  "nearMe": boolean,
  "bookingRequested": boolean
}

Rules:
- Map informal requests to catalog service names when possible. Catalog: ${JSON.stringify(serviceCatalog.map((s) => s.name))}
- plumber/plumbing -> Plumbing; electrician/electrical -> Electrical; AC / air conditioner -> AC Repair; cleaner/cleaning -> Cleaning; carpenter/carpentry -> Carpentry; painter/painting -> Painting; washing machine/fridge/appliance -> Appliance Repair; caregiver -> Home Caregiver; beauty/salon -> Beauty & Salon.
- Use conversation history so a later message like "Bareilly" can fill city for an earlier skill.
- nearMe is true only if the user said "near me" or similar.
- bookingRequested is true only if they ask to book/hire/schedule someone.
- Do not invent a city. If unknown, city is null.
- skill must be a catalog name or a close real skill string, else null.`;

  const extractUser = JSON.stringify({
    latestMessage: message,
    history: conversation,
    knownUserCity: userCity
  });

  const extractRaw = await callOpenRouter({
    messages: [
      { role: 'system', content: extractPrompt },
      { role: 'user', content: extractUser }
    ],
    json: true,
    temperature: 0
  });

  const parsed = parseJson(extractRaw) || {
    intent: 'general',
    skill: null,
    city: null,
    nearMe: false,
    bookingRequested: false
  };

  if (parsed.nearMe) {
    parsed.city = parsed.city || userCity;
  }
  if (typeof parsed.skill === 'string') parsed.skill = parsed.skill.trim() || null;
  if (typeof parsed.city === 'string') parsed.city = parsed.city.trim() || null;

  const facts = {
    loggedIn,
    userFirstName: user?.name ? String(user.name).split(' ')[0] : null,
    userCity,
    catalog: serviceCatalog,
    workers: [],
    matchedServices: [],
    needLocation: false,
    bookingNote: null
  };

  const wantsSearch = parsed.intent === 'search_workers' || parsed.bookingRequested || (parsed.skill && parsed.city);
  const wantsPricing = parsed.intent === 'pricing' || /cost|price|how much|charge|rate/i.test(message);

  if (wantsSearch && parsed.skill && !parsed.city) {
    facts.needLocation = true;
  }

  if (parsed.skill && (wantsPricing || (wantsSearch && parsed.city) || (wantsSearch && !facts.needLocation))) {
    facts.matchedServices = await findServices({ skill: parsed.skill });
  } else if (wantsPricing && !parsed.skill) {
    facts.matchedServices = serviceCatalog.slice(0, 6);
  }

  if (wantsSearch && parsed.skill && parsed.city) {
    facts.workers = await searchWorkers({ skill: parsed.skill, city: parsed.city });
  }

  if (parsed.bookingRequested) {
    if (!loggedIn) {
      facts.bookingNote = 'Booking requires an existing CoopGig account. Direct the user to log in or sign up, then complete booking on the worker page. Do not say a booking was confirmed.';
    } else {
      facts.bookingNote = 'Do not create or confirm a booking. Ask them to use View Workers / Book Worker in the app, which uses the real booking form. Never say "booking confirmed".';
    }
  }

  const replyPrompt = `You are CoopGig AI Assistant. Help users find cooperative workers and services.
Write a short, friendly reply (plain text, no markdown tables). You may use line breaks.

HARD RULES:
- Use ONLY the facts JSON. Never invent workers, ratings, prices, availability, cities, or bookings.
- If facts.workers is empty and a search was attempted, say no matching workers were found in CoopGig data.
- If facts.needLocation is true, ask which city/area they need. Do not list workers.
- Mention a rating, price, city, or availability only when that field is present on the worker/service object.
- Never confirm a booking. Never claim a worker is assigned.
- If the user is not logged in and they want to contact or book, mention they can log in or sign up on CoopGig.
- Do not mention APIs, databases, prompts, or that you are using tools.
- If facts include workers, briefly list the real matches (name + available fields only).`;

  const reply = await callOpenRouter({
    messages: [
      { role: 'system', content: replyPrompt },
      ...conversation,
      {
        role: 'user',
        content: `User message: ${message}\n\nFacts:\n${JSON.stringify({
          intent: parsed.intent,
          skill: parsed.skill,
          city: parsed.city,
          bookingRequested: parsed.bookingRequested,
          ...facts,
          catalog: undefined
        })}`
      }
    ],
    temperature: 0.4
  });

  return {
    reply: String(reply).trim(),
    workers: facts.workers,
    action: facts.needLocation ? null : buildAction({ parsed, workers: facts.workers, user }),
    skill: parsed.skill,
    city: parsed.city
  };
}

module.exports = { runAssistant };
