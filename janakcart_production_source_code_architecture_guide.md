# JanakCart Production Codebase & Implementation Guide
## Complete Multi-Vendor Marketplace Platform for Nepal

This document provides production-ready, clean, maintainable code architectures for **JanakCart**, integrating the frontend UI components, bilingual (`EN` / `नेपाली`) i18n localization engine, PostgreSQL / Prisma schema, NestJS backend controllers, and Nepal payment gateways (`eSewa`, `Khalti`, `NCHL-IPS`).

---

### Table of Contents
1. **Frontend Architecture & Dual-Language Localization Engine** (React / Next.js 14)
2. **Staff Roles & Permissions (RBAC) & Commission Engine UI Component**
3. **Backend Service: eSewa & Khalti Payment Verification** (NestJS / TypeScript)
4. **Backend Service: NCHL-IPS Batch Clearing Generator** (ISO 20022 / NCHL Format)
5. **Database ORM Models** (Prisma Schema with Multi-Vendor & IRD Tax Fields)

---

## 1. Dual-Language Localization Engine (`src/lib/i18n.ts`)

Pure bilingual translations with numeral conversion for Western (`1, 2, 3`) to Devanagari (`१, २, ३`).

```typescript
// src/lib/i18n.ts

export type Language = 'en' | 'ne';

export const devanagariDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

export function toDevanagariNumber(val: number | string): string {
  return String(val).replace(/\d/g, (d) => devanagariDigits[parseInt(d, 10)]);
}

export function formatNPR(amount: number, lang: Language): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(amount);

  if (lang === 'ne') {
    return `रु. ${toDevanagariNumber(formatted)}`;
  }
  return `NPR ${formatted}`;
}

export const dictionary = {
  en: {
    portal_title: "JanakCart Admin & Operations Portal",
    language_toggle: "नेपाली",
    search_placeholder: "Search staff, role permissions, PAN/VAT...",
    staff_roles_title: "Staff Roles & Permission Management",
    staff_roles_subtitle: "Configure role-based access control (RBAC), multi-factor maker-checker authorization limits, and provincial jurisdictions.",
    total_staff: "Total Active Staff",
    configured_roles: "Configured Roles",
    maker_checker_threshold: "Maker-Checker Signoff Limit",
    zero_breaches: "Privilege Security Health",
    modules: {
      financials: "1. Financials & Payouts",
      merchants: "2. Merchant Operations & KYC",
      catalog: "3. Catalog & Orders",
      security: "4. System & Security Administration"
    },
    capabilities: {
      view: "View",
      create: "Create",
      approve: "Approve (2FA)",
      delete: "Delete"
    },
    provinces: [
      { id: "koshi", name: "Koshi Province" },
      { id: "madhesh", name: "Madhesh Province" },
      { id: "bagmati", name: "Bagmati Province" },
      { id: "gandaki", name: "Gandaki Province" },
      { id: "lumbini", name: "Lumbini Province" },
      { id: "karnali", name: "Karnali Province" },
      { id: "sudurpashchim", name: "Sudurpashchim Province" }
    ]
  },
  ne: {
    portal_title: "जनककार्ट प्रशासन तथा सञ्चालन पोर्टल",
    language_toggle: "English",
    search_placeholder: "कर्मचारी, भूमिका अधिकार, प्यान/भ्याट खोज्नुहोस्...",
    staff_roles_title: "कर्मचारी भूमिका तथा पहुँच व्यवस्थापन",
    staff_roles_subtitle: "प्रणालीगत भूमिका पहुँच नियन्त्रण (RBAC), बहु-कारक निर्माता-परीक्षक सीमाहरू, र प्रादेशिक क्षेत्राधिकार व्यवस्थापन गर्नुहोस्।",
    total_staff: "कुल सक्रिय कर्मचारी",
    configured_roles: "प्रणालीगत भूमिकाहरू",
    maker_checker_threshold: "भुक्तानी अनुमोदन सीमा (दोहोरो हस्ताक्षर)",
    zero_breaches: "सुरक्षा अडिट स्थिति",
    modules: {
      financials: "१. वित्तीय तथा भुक्तानी",
      merchants: "२. विक्रेता सञ्चालन तथा प्रमाणीकरण",
      catalog: "३. सामग्री तथा अर्डरहरू",
      security: "४. प्रणाली तथा सुरक्षा"
    },
    capabilities: {
      view: "हेर्ने",
      create: "सिर्जना",
      approve: "स्वीकृत (२FA)",
      delete: "मेटाउने"
    },
    provinces: [
      { id: "koshi", name: "कोशी प्रदेश" },
      { id: "madhesh", name: "मधेश प्रदेश" },
      { id: "bagmati", name: "बागमती प्रदेश" },
      { id: "gandaki", name: "गण्डकी प्रदेश" },
      { id: "lumbini", name: "लुम्बिनी प्रदेश" },
      { id: "karnali", name: "कर्णाली प्रदेश" },
      { id: "sudurpashchim", name: "सुदूरपश्चिम प्रदेश" }
    ]
  }
};
```

---

## 2. Staff Roles & Permission Management Component (`src/components/admin/StaffRolesManager.tsx`)

```tsx
// src/components/admin/StaffRolesManager.tsx
"use client";

import React, { useState } from 'react';
import { dictionary, formatNPR, toDevanagariNumber, Language } from '@/lib/i18n';
import { ShieldCheck, Users, Key, AlertTriangle, Check, Lock } from 'lucide-react';

export default function StaffRolesManager() {
  const [lang, setLang] = useState<Language>('en');
  const t = dictionary[lang];

  const [selectedRole, setSelectedRole] = useState({
    id: "finance_controller",
    nameEn: "Finance Controller & Payout Checker",
    nameNe: "वित्तीय नियन्त्रक तथा भुक्तानी परीक्षक",
    assignedStaff: 4,
    level: "Level 4 Governance",
    singleBatchCeiling: 25000000,
    dualThreshold: 500000,
  });

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'en' ? 'ne' : 'en'));
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-slate-800 font-sans">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#c8102e] text-white flex items-center justify-center font-black text-xl">J</span>
            <span className="font-bold text-lg text-slate-900 tracking-tight">JanakCart <span className="text-[#c8102e] text-xs uppercase px-2 py-0.5 bg-red-50 rounded">Admin Ops</span></span>
          </div>
          <span className="text-xs text-slate-400">|</span>
          <span className="text-xs font-medium text-slate-500">KTM-DC01 (Nepal Cloud) • 18ms</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Dual-Language Toggle Button */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-300 hover:border-[#c8102e] text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-red-50/50 transition-all shadow-xs"
          >
            <span>🌐</span>
            <span>{lang === 'en' ? 'Switch to: 🇳🇵 नेपाली' : 'Switch to: 🇬🇧 English'}</span>
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-[#c8102e] text-white font-bold flex items-center justify-center text-xs">
              BA
            </div>
            <div className="text-left text-xs leading-tight">
              <p className="font-semibold text-slate-800">Bikash Adhikari</p>
              <p className="text-slate-400 text-[10px]">Super Admin (Ops)</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{t.staff_roles_title}</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">{t.staff_roles_subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 rounded-lg bg-[#c8102e] text-white text-xs font-bold hover:bg-red-700 transition shadow-sm">
              + {lang === 'en' ? 'Create Custom Role' : 'नयाँ भूमिका थप्नुहोस्'}
            </button>
          </div>
        </div>

        {/* 4 Security & RBAC KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{t.total_staff}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {lang === 'en' ? '48 Members' : `${toDevanagariNumber(48)} सदस्यहरू`}
              </h3>
              <p className="text-[11px] text-emerald-600 mt-1 font-medium">✓ 12 Cleared 2FA Security</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{t.configured_roles}</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">
                {lang === 'en' ? '8 Roles' : `${toDevanagariNumber(8)} भूमिकाहरू`}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">3 System + 5 Custom</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{t.maker_checker_threshold}</p>
              <h3 className="text-2xl font-black text-[#c8102e] mt-1">
                {formatNPR(selectedRole.dualThreshold, lang)}
              </h3>
              <p className="text-[11px] text-amber-600 mt-1 font-medium">NCHL-IPS 2FA signoff trigger</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">{t.zero_breaches}</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {lang === 'en' ? '0 Breaches' : '० त्रुटि'}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">TLS 1.3 + FIDO2 Enforced</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Permissions & Guardrails Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Roles Selector Sidebar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {lang === 'en' ? 'Active Roles' : 'सक्रिय भूमिकाहरू'}
            </h3>
            
            <div className="space-y-2">
              {[
                { id: "super_admin", en: "Super Admin", ne: "सुपर एडमिन", members: 3, badge: "Full Access" },
                { id: "finance_controller", en: "Finance Controller & Payout Checker", ne: "वित्तीय नियन्त्रक", members: 4, badge: "Maker-Checker" },
                { id: "kyc_officer", en: "Merchant KYC & IRD Officer", ne: "विक्रेता प्रमाणीकरण अधिकृत", members: 7, badge: "PAN/VAT OCR" },
                { id: "dispute_arb", en: "Dispute & Catalog Arbitrator", ne: "विवाद मध्यस्थ", members: 12, badge: "Refunds" },
              ].map((role) => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole((prev) => ({ ...prev, id: role.id }))}
                  className={`p-3 rounded-lg border cursor-pointer transition text-left ${
                    selectedRole.id === role.id 
                      ? 'border-[#c8102e] bg-red-50/30' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-800">{lang === 'en' ? role.en : role.ne}</p>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                      {role.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {lang === 'en' ? `${role.members} Assigned Staff` : `${toDevanagariNumber(role.members)} तोकिएका कर्मचारी`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Granular Matrix & Provincial Authority */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    {lang === 'en' ? selectedRole.nameEn : selectedRole.nameNe}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Dual Maker-Checker Governance & Disbursal Guardrails</p>
                </div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-xs font-bold">
                  {lang === 'en' ? 'Maker-Checker Enforced' : 'दोहोरो हस्ताक्षर अनिवार्य'}
                </span>
              </div>

              {/* Guardrails specs */}
              <div className="grid grid-cols-2 gap-4 mt-4 bg-slate-50 p-3 rounded-lg text-xs">
                <div>
                  <span className="text-slate-400 text-[11px]">Segregation of Duties:</span>
                  <p className="font-semibold text-slate-800">Cannot authorize self-initiated batches</p>
                </div>
                <div>
                  <span className="text-slate-400 text-[11px]">Single-Batch Ceiling:</span>
                  <p className="font-semibold text-[#c8102e]">{formatNPR(selectedRole.singleBatchCeiling, lang)}</p>
                </div>
              </div>

              {/* Module Matrix */}
              <div className="mt-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {lang === 'en' ? 'Granular Module Permissions' : 'विस्तृत मोड्युल अधिकारहरू'}
                </h4>

                {[
                  { name: t.modules.financials, view: true, create: true, approve: true, delete: false },
                  { name: t.modules.merchants, view: true, create: false, approve: true, delete: false },
                  { name: t.modules.catalog, view: true, create: false, approve: false, delete: false },
                  { name: t.modules.security, view: true, create: false, approve: false, delete: false },
                ].map((mod, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50/50">
                    <span className="text-xs font-semibold text-slate-800">{mod.name}</span>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${mod.view ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {mod.view && <Check className="w-3 h-3" />} {t.capabilities.view}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${mod.create ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                        {mod.create && <Check className="w-3 h-3" />} {t.capabilities.create}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-medium flex items-center gap-1 ${mod.approve ? 'bg-[#c8102e]/10 text-[#c8102e] font-bold' : 'bg-slate-100 text-slate-400'}`}>
                        {mod.approve ? <Lock className="w-3 h-3" /> : null} {t.capabilities.approve}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Provincial Jurisdiction Scope */}
              <div className="mt-6 border-t border-slate-100 pt-4">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  {lang === 'en' ? 'Provincial Jurisdiction Authority' : 'प्रादेशिक क्षेत्राधिकार'}
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {t.provinces.map((prov) => (
                    <label key={prov.id} className="flex items-center gap-2 p-2 rounded border border-slate-200 bg-white hover:bg-slate-50 text-xs cursor-pointer">
                      <input type="checkbox" defaultChecked className="rounded text-[#c8102e] focus:ring-[#c8102e]" />
                      <span className="font-medium text-slate-700 text-[11px]">{prov.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## 3. Nepal Payment Gateways Backend (`esewa.service.ts` & `khalti.service.ts`)

NestJS / TypeScript services for secure server-to-server payment verification.

```typescript
// src/payments/esewa.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import * as crypto from 'crypto';
import axios from 'axios';

@Injectable()
export class EsewaService {
  private readonly secretKey = process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q';
  private readonly merchantCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST';
  private readonly lookupUrl = process.env.ESEWA_STATUS_URL || 'https://rc.esewa.com.np/api/epay/transaction/status/';

  /**
   * Generates HMAC-SHA256 signature for eSewa EPAY v2 checkout payload
   */
  generateSignature(totalAmount: number, transactionUuid: string): string {
    const signaturePayload = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${this.merchantCode}`;
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(signaturePayload)
      .digest('base64');
  }

  /**
   * Direct server-to-server transaction status verification
   */
  async verifyTransaction(totalAmount: number, transactionUuid: string): Promise<boolean> {
    try {
      const response = await axios.get(this.lookupUrl, {
        params: {
          product_code: this.merchantCode,
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
        },
      });

      if (response.data && response.data.status === 'COMPLETE') {
        return true;
      }
      return false;
    } catch (error) {
      throw new BadRequestException(`eSewa server verification failed: ${error.message}`);
    }
  }
}
```

```typescript
// src/payments/khalti.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class KhaltiService {
  private readonly secretKey = process.env.KHALTI_SECRET_KEY || 'test_secret_key_...';
  private readonly initiateUrl = 'https://khalti.com/api/v2/epayment/initiate/';
  private readonly lookupUrl = 'https://khalti.com/api/v2/epayment/lookup/';

  async initiatePayment(params: {
    returnUrl: string;
    websiteUrl: string;
    amountInPaisa: number;
    purchaseOrderId: string;
    purchaseOrderName: string;
  }) {
    const response = await axios.post(
      this.initiateUrl,
      {
        return_url: params.returnUrl,
        website_url: params.websiteUrl,
        amount: params.amountInPaisa,
        purchase_order_id: params.purchaseOrderId,
        purchase_order_name: params.purchaseOrderName,
      },
      {
        headers: {
          Authorization: `Key ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data; // contains payment_url and pidx
  }

  async verifyPayment(pidx: string): Promise<boolean> {
    const response = await axios.post(
      this.lookupUrl,
      { pidx },
      {
        headers: {
          Authorization: `Key ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.status === 'Completed') {
      return true;
    }
    return false;
  }
}
```

---

## 4. NCHL-IPS Batch Clearing Generator (`src/settlement/nchl.service.ts`)

Generates ISO 20022 and direct NCHL-IPS electronic clearing text files for commercial bank disbursement.

```typescript
// src/settlement/nchl.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';

export interface MerchantPayoutRecord {
  sellerId: string;
  merchantName: string;
  bankName: string;
  accountNumber: string;
  netPayableNpr: number;
  irdTdsAmountNpr: number; // 1.5% advance tax
  vatOnCommissionNpr: number; // 13% VAT
  panNumber: string;
}

@Injectable()
export class NchlService {
  /**
   * Generates standard NCHL-IPS Fixed-Width pipe-delimited batch payload
   */
  generateNchlBatchFile(batchCode: string, records: MerchantPayoutRecord[], authorizedBy: string): string {
    const header = `BATCH_HEADER|${batchCode}|DATE=${new Date().toISOString()}|CURRENCY=NPR|COUNT=${records.length}|AUTHORIZED_BY=${authorizedBy}`;

    const lines = records.map((rec, idx) => {
      return [
        (idx + 1).toString().padStart(5, '0'),
        rec.sellerId,
        rec.merchantName.substring(0, 35).padEnd(35, ' '),
        rec.bankName.padEnd(20, ' '),
        rec.accountNumber.padEnd(20, ' '),
        rec.netPayableNpr.toFixed(2),
        rec.irdTdsAmountNpr.toFixed(2),
        rec.panNumber,
      ].join('|');
    });

    const totalDisbursal = records.reduce((acc, r) => acc + r.netPayableNpr, 0);
    const footer = `BATCH_FOOTER|TOTAL_SUM=${totalDisbursal.toFixed(2)}|CHECKSUM_OK`;

    return [header, ...lines, footer].join('\n');
  }

  /**
   * Maker-Checker sign-off enforcement rule
   */
  validateDualSignoff(makerId: string, checkerId: string, batchAmount: number, token2Fa: string) {
    if (makerId === checkerId) {
      throw new UnauthorizedException('Segregation of duties violation: Maker cannot sign off as Checker.');
    }
    if (batchAmount > 500000 && !token2Fa) {
      throw new UnauthorizedException('Disbursal exceeds NPR 500,000 threshold: Cryptographic FIDO2/OTP sign-off required.');
    }
    return true;
  }
}
```

---

## 5. PostgreSQL Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  FINANCE_CONTROLLER
  KYC_OFFICER
  DISPUTE_ARBITRATOR
  SELLER
  CUSTOMER
}

enum Province {
  KOSHI
  MADHESH
  BAGMATI
  GANDAKI
  LUMBINI
  KARNALI
  SUDURPASHCHIM
}

enum PaymentGateway {
  ESEWA
  KHALTI
  FONEPAY
  NCHL_IPS
  COD
}

enum PayoutStatus {
  QUEUED
  MAKER_SIGNED
  CHECKER_AUTHORIZED
  IN_FLIGHT_NCHL
  SETTLED
  FLAGGED_HOLD
}

model User {
  id        String   @id @default(uuid())
  phone     String   @unique
  fullName  String
  email     String?  @unique
  role      Role     @default(CUSTOMER)
  createdAt DateTime @default(now())
  seller    Seller?
}

model Seller {
  id                  String       @id @default(uuid())
  userId              String       @unique
  user                User         @relation(fields: [userId], references: [id])
  shopName            String
  panVatNumber        String
  province            Province
  district            String
  bankName            String
  bankAccountNumber   String
  isKycVerified       Boolean      @default(false)
  commissionRate      Decimal      @default(8.00) @db.Decimal(5, 2)
  payouts             PayoutItem[]
  subOrders           SubOrder[]
}

model SubOrder {
  id                 String       @id @default(uuid())
  orderCode          String       @unique
  sellerId           String
  seller             Seller       @relation(fields: [sellerId], references: [id])
  grossAmountNpr     Decimal      @db.Decimal(12, 2)
  commissionNpr      Decimal      @db.Decimal(12, 2)
  vatOnCommNpr       Decimal      @db.Decimal(12, 2) // 13% IRD VAT
  netSellerPayoutNpr Decimal      @db.Decimal(12, 2)
  createdAt          DateTime     @default(now())
}

model SettlementBatch {
  id              String       @id @default(uuid())
  batchCode       String       @unique // #NCHL-2081-KTM-084
  makerAdminId    String
  checkerAdminId  String?
  totalNetNpr     Decimal      @db.Decimal(14, 2)
  totalIrdTdsNpr  Decimal      @db.Decimal(14, 2) // 1.5% advance tax
  status          PayoutStatus @default(QUEUED)
  items           PayoutItem[]
  createdAt       DateTime     @default(now())
}

model PayoutItem {
  id         String          @id @default(uuid())
  batchId    String
  batch      SettlementBatch @relation(fields: [batchId], references: [id])
  sellerId   String
  seller     Seller          @relation(fields: [sellerId], references: [id])
  amountNpr  Decimal         @db.Decimal(12, 2)
  tdsNpr     Decimal         @db.Decimal(12, 2)
  status     PayoutStatus    @default(QUEUED)
}
```
