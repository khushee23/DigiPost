import React from 'react';
import {
  ArrowRight,
  Boxes,
  FileCheck2,
  Headphones,
  Package,
  Search,
  ShieldCheck,
  Truck,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

const services = [
  {
    icon: Zap,
    title: 'Express Post',
    description: 'Priority handling for time-sensitive consignments, with clear progress updates from booking through delivery.',
    tone: 'bg-red-50 text-[#D71920]',
    tag: 'Priority',
  },
  {
    icon: Package,
    title: 'Standard Parcel',
    description: 'A dependable option for everyday parcels, gifts, books, clothing, and household items.',
    tone: 'bg-blue-50 text-blue-600',
    tag: 'Everyday delivery',
  },
  {
    icon: FileCheck2,
    title: 'Registered Documents',
    description: 'Book important papers with sender and recipient details, a unique tracking ID, and a delivery history.',
    tone: 'bg-emerald-50 text-emerald-600',
    tag: 'Documents',
  },
  {
    icon: ShieldCheck,
    title: 'Fragile Handling',
    description: 'Mark delicate contents and special instructions so staff can see handling notes during parcel processing.',
    tone: 'bg-amber-50 text-amber-600',
    tag: 'Special care',
  },
  {
    icon: Boxes,
    title: 'Heavy Consignments',
    description: 'Record heavier parcels with their weight, destination, and estimated postage during booking.',
    tone: 'bg-violet-50 text-violet-600',
    tag: 'Freight',
  },
  {
    icon: Search,
    title: 'Parcel Tracking',
    description: 'Use a tracking ID to review parcel milestones and the latest recorded delivery status.',
    tone: 'bg-neutral-100 text-neutral-800',
    tag: 'Track online',
    link: '/track',
    linkLabel: 'Track a parcel',
  },
  {
    icon: Truck,
    title: 'Courier Dispatch',
    description: 'Postal administrators assign consignments to couriers, who update delivery progress from their portal.',
    tone: 'bg-orange-50 text-orange-600',
    tag: 'Operations',
  },
  {
    icon: Headphones,
    title: 'Customer Support',
    description: 'Customers can submit parcel-related complaints and follow their resolution through the support workflow.',
    tone: 'bg-neutral-100 text-neutral-800',
    tag: 'Help & support',
    link: '/login',
    linkLabel: 'Open customer portal',
  },
];

export const ServicesPage = () => (
  <div className="bg-white">
    <section className="bg-gradient-to-b from-neutral-50 via-white to-neutral-50 border-b border-neutral-200 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#D71920]">
          <Package className="w-4 h-4" />
          DigiPost Services
        </span>
        <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tight text-[#111111]">
          Postal services, <span className="text-[#D71920]">made simpler.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base leading-relaxed text-neutral-600">
          Book consignments, follow their progress, coordinate courier delivery, and get support through one connected postal operations platform.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/register">
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Get Started
            </Button>
          </Link>
          <Link to="/track">
            <Button variant="outline" size="md" icon={Search}>
              Track a Parcel
            </Button>
          </Link>
        </div>
      </div>
    </section>

    <section className="py-16 sm:py-20 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-wider text-[#D71920]">What you can do</p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            One platform for the full parcel journey
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-neutral-600">
            Choose a service and keep booking details and delivery updates together in the parcel record.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map(({ icon: Icon, title, description, tone, tag, link, linkLabel }) => (
            <article
              key={title}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs transition-shadow hover:shadow-md"
            >
              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">{tag}</span>
              <h3 className="text-base font-bold text-neutral-900">{title}</h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-neutral-600">{description}</p>
              {link && (
                <Link to={link} className="mt-5 inline-flex items-center gap-1 text-xs font-semibold text-[#D71920] hover:underline">
                  {linkLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="border-t border-neutral-800 bg-[#111111] py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D71920]">Ready to send?</p>
          <h2 className="mt-1 text-xl font-bold">Create a booking and get a tracking ID.</h2>
        </div>
        <Link to="/register">
          <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
            Create an Account
          </Button>
        </Link>
      </div>
    </section>
  </div>
);
