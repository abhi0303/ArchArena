import { AppWindow, BadgeCheck, Container, Database, Network, Router, ServerCog, ShieldCheck, type LucideIcon } from 'lucide-react';
import { bi } from '@/features/learn/dsl';
import type { Bi, PrepKind, PrepLevel, PrepQuestion } from './types';

export interface PrepTopic {
  id: string;
  title: string;
  description: Bi;
}

export interface PrepCategory {
  id: string;
  title: string;
  icon: LucideIcon;
  /** Key of ACCENTS in components/icons. */
  accent: string;
  description: Bi;
  topics: PrepTopic[];
}

/**
 * Categories and their topics, in display order. To add a topic (for example “Vue” under
 * Frontend), add it here; questions then refer to it by id.
 */
export const PREP_CATEGORIES: PrepCategory[] = [
  {
    id: 'frontend',
    title: 'Frontend',
    icon: AppWindow,
    accent: 'sky',
    description: bi('Browsers, rendering, performance and UI frameworks.', 'Browsers, rendering, performance aur UI frameworks.'),
    topics: [
      { id: 'general', title: 'General frontend', description: bi('HTML, CSS, JavaScript, the browser and web performance.', 'HTML, CSS, JavaScript, browser aur web performance.') },
      { id: 'react', title: 'React', description: bi('Components, hooks, state, rendering and the React ecosystem.', 'Components, hooks, state, rendering aur React ecosystem.') },
      { id: 'angular', title: 'Angular', description: bi('Components, services, dependency injection, RxJS and change detection.', 'Components, services, dependency injection, RxJS aur change detection.') },
    ],
  },
  {
    id: 'backend',
    title: 'Backend',
    icon: ServerCog,
    accent: 'violet',
    description: bi('APIs, concurrency, resilience and server-side frameworks.', 'APIs, concurrency, resilience aur server-side frameworks.'),
    topics: [
      { id: 'general', title: 'General backend', description: bi('API design, concurrency, retries and other ideas every backend developer needs.', 'API design, concurrency, retries aur har backend developer ke zaroori concepts.') },
      { id: 'nodejs', title: 'Node.js', description: bi('The event loop, streams, async patterns and running Node in production.', 'Event loop, streams, async patterns aur production mein Node chalana.') },
      { id: 'nestjs', title: 'NestJS', description: bi('Modules, providers, guards, interceptors and structuring NestJS apps.', 'Modules, providers, guards, interceptors aur NestJS apps ka structure.') },
    ],
  },
  {
    id: 'database',
    title: 'Databases',
    icon: Database,
    accent: 'emerald',
    description: bi('Indexes, queries, transactions and keeping databases fast.', 'Indexes, queries, transactions aur databases ko fast rakhna.'),
    topics: [
      { id: 'general', title: 'Fundamentals', description: bi('Indexes, transactions, normalisation, SQL vs NoSQL.', 'Indexes, transactions, normalisation aur SQL vs NoSQL ki buniyaad.') },
      { id: 'performance', title: 'Performance & tuning', description: bi('Slow queries, query plans, connection pools and scaling databases.', 'Slow queries, query plans, connection pools aur databases ko scale karna.') },
    ],
  },
  {
    id: 'system-design',
    title: 'System Design',
    icon: Network,
    accent: 'fuchsia',
    description: bi('Architecture choices, scaling, caching and asynchronous systems.', 'Architecture ke faisle, scaling, caching aur asynchronous systems.'),
    topics: [
      { id: 'architecture', title: 'Architecture', description: bi('Monoliths, microservices and distributed systems.', 'Monoliths, microservices aur distributed systems.') },
      { id: 'scaling', title: 'Scaling & caching', description: bi('Handling more users: caching, replication and partitioning.', 'Zyaada users sambhaalna: caching, replication aur partitioning.') },
      { id: 'messaging', title: 'Messaging & async', description: bi('Queues, streams and event-driven design.', 'Queues, streams aur event-driven design.') },
    ],
  },
  {
    id: 'servers',
    title: 'Servers & Networking',
    icon: Router,
    accent: 'cyan',
    description: bi('How traffic reaches your servers: HTTP, DNS, proxies and load balancers.', 'Traffic aapke servers tak kaise pahunchta hai: HTTP, DNS, proxies aur load balancers.'),
    topics: [
      { id: 'networking', title: 'Networking & protocols', description: bi('HTTP, TCP, DNS, TLS and what happens when you open a URL.', 'HTTP, TCP, DNS, TLS aur URL kholne pe kya hota hai.') },
      { id: 'load-balancing', title: 'Load balancing & traffic', description: bi('Load balancers, reverse proxies and gateways.', 'Load balancers, reverse proxies aur gateways.') },
    ],
  },
  {
    id: 'security',
    title: 'Security',
    icon: ShieldCheck,
    accent: 'rose',
    description: bi('Authentication, authorization and protecting applications.', 'Authentication, authorization aur applications ki suraksha.'),
    topics: [
      { id: 'general', title: 'Application security', description: bi('OWASP risks, input validation, secrets and secure defaults.', 'OWASP risks, input validation, secrets aur secure defaults.') },
      { id: 'auth', title: 'Authentication & SSO', description: bi('Sessions, tokens, OAuth 2.0, OpenID Connect and single sign-on.', 'Sessions, tokens, OAuth 2.0, OpenID Connect aur single sign-on.') },
    ],
  },
  {
    id: 'devops',
    title: 'DevOps & Cloud',
    icon: Container,
    accent: 'orange',
    description: bi('Shipping code, running it on Kubernetes, watching it and handling incidents.', 'Code ship karna, Kubernetes pe chalana, uspe nazar rakhna aur incidents sambhaalna.'),
    topics: [
      { id: 'cicd', title: 'CI/CD', description: bi('Pipelines, reviews, deployments and release strategies.', 'Pipelines, reviews, deployments aur release strategies.') },
      { id: 'kubernetes', title: 'Kubernetes', description: bi('Pods, probes, deployments and debugging workloads.', 'Pods, probes, deployments aur workloads debug karna.') },
      { id: 'observability', title: 'Observability & monitoring', description: bi('Logs, metrics, traces, alerts and finding problems fast.', 'Logs, metrics, traces, alerts aur problems jaldi dhoondhna.') },
      { id: 'incidents', title: 'Incidents & on-call', description: bi('Responding to outages and learning from them.', 'Outages pe response dena aur unse seekhna.') },
    ],
  },
  {
    id: 'practices',
    title: 'Engineering Practices',
    icon: BadgeCheck,
    accent: 'lime',
    description: bi('Quality, testing, ownership and how you work in a team.', 'Quality, testing, ownership aur team mein aap kaise kaam karte ho.'),
    topics: [
      { id: 'quality', title: 'Code quality & testing', description: bi('Testing strategy, code review and keeping quality high.', 'Testing strategy, code review aur quality oonchi rakhna.') },
      { id: 'behavioral', title: 'Behavioral & teamwork', description: bi('Collaboration, ownership and “tell me about a time…” questions.', 'Collaboration, ownership aur “ek baar ka kissa batao…” wale sawaal.') },
    ],
  },
];

const byId = new Map(PREP_CATEGORIES.map((c) => [c.id, c]));

export function getPrepCategory(id: string): PrepCategory | undefined {
  return byId.get(id);
}

export function getPrepTopic(categoryId: string, topicId: string): PrepTopic | undefined {
  return byId.get(categoryId)?.topics.find((t) => t.id === topicId);
}

export const questionPath = (q: Pick<PrepQuestion, 'category' | 'id'>) => `/prep/${q.category}/${q.id}`;

export const KIND_LABEL: Record<PrepKind, string> = { concept: 'Concept', scenario: 'Scenario', comparison: 'Comparison', behavioral: 'Behavioral' };

export const LEVEL_LABEL: Record<PrepLevel, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
