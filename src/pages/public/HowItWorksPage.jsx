import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  MapPin,
  Package,
  Search,
  Send,
  Truck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';

const steps = [
  {
    number: '01',
    icon: Send,
    title: 'Book your parcel',
    description: 'Enter sender and recipient details, select a parcel category, and add the weight and any handling notes.',
    detail: 'A booking creates a parcel record with its own tracking ID and estimated postage.',
  },
  {
    number: '02',
    icon: ClipboardList,
    title: 'Prepare for dispatch',
    description: 'The parcel appears in the administration manifest, where an administrator can assign it to an active courier.',
    detail: 'The courier receives the assignment in their delivery workspace.',
  },
  {
    number: '03',
    icon: Truck,
    title: 'Follow delivery progress',
    description: 'Couriers update the parcel status as it moves through dispatch and delivery stages.',
    detail: 'Customers can follow the latest recorded milestones using the tracking ID.',
  },
  {
    number: '04',
    icon: CheckCircle2,
    title: 'Complete the delivery',
    description: 'The courier records delivery or an unsuccessful attempt, with a reason required for a failed attempt.',
    detail: 'After delivery, customers can share feedback or contact support about the parcel.',
  },
];

export const HowItWorksPage = () => (
  <div className="bg-white">
    <section className="relative overflow-hidden border-b border-neutral-200 bg-gradient-to-b from-neutral-50 via-white to-neutral-50 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-[#D71920]">
          <MapPin className="h-4 w-4" />
          From booking to doorstep
        </span>
        <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-[#111111] sm:text-5xl">
          How <span className="text-[#D71920]">DigiPost works</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-neutral-600 sm:text-base">
          A clear journey connects customer bookings, postal administration, courier updates, and parcel tracking.
        </p>
      </div>
    </section>

    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-[#D71920]">Four simple steps</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
            A connected postal workflow
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {steps.map(({ number, icon: Icon, title, description, detail }) => (
            <article key={number} className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1C1C1C] text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#D71920]">Step {number}</span>
                  <h3 className="mt-1 text-lg font-bold text-neutral-900">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-600">{description}</p>
                  <div className="mt-4 flex items-start gap-2 rounded-xl bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-600">
                    <Package className="mt-0.5 h-4 w-4 shrink-0 text-[#D71920]" />
                    <span>{detail}</span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="bg-neutral-50 py-14">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D71920]">Customer</span>
          <h3 className="mt-2 text-base font-bold text-neutral-900">Book and follow</h3>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">Create bookings, review parcel history, track progress, and raise support requests.</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D71920]">Administrator</span>
          <h3 className="mt-2 text-base font-bold text-neutral-900">Coordinate operations</h3>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">Manage parcels, assign couriers, monitor deliveries, and review reports and complaints.</p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <span className="text-xs font-bold uppercase tracking-wider text-[#D71920]">Courier</span>
          <h3 className="mt-2 text-base font-bold text-neutral-900">Update the route</h3>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">View assigned deliveries and record each supported delivery status transition.</p>
        </div>
      </div>
    </section>

    <section className="bg-[#111111] py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-4 text-center sm:px-6 md:flex-row md:text-left lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#D71920]">Start here</p>
          <h2 className="mt-1 text-xl font-bold">Ready to book or check a parcel?</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link to="/register">
            <Button variant="primary" size="md" icon={ArrowRight} iconPosition="right">
              Book a Parcel
            </Button>
          </Link>
          <Link to="/track">
            <Button variant="outline" size="md" icon={Search} className="border-neutral-600 bg-neutral-900 text-white hover:bg-neutral-800">
              Track a Parcel
            </Button>
          </Link>
        </div>
      </div>
    </section>
  </div>
);
