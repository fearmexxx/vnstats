export interface SecurityFirm {
  id: string;
  name: string;
  fullName: string;
  marketShare: number; // Q1 2026 HOSE market share (%)
  facebookUrl?: string;
  tiktokUrl?: string;
}

export const TOP_15_FIRMS: SecurityFirm[] = [
  { id: 'VPS', name: 'VPS', fullName: 'VPS Securities', marketShare: 15.32 },
  { id: 'SSI', name: 'SSI', fullName: 'SSI Securities', marketShare: 11.14 },
  { id: 'TCBS', name: 'TCBS', fullName: 'Techcom Securities', marketShare: 8.85 },
  { id: 'VCI', name: 'VCI', fullName: 'Vietcap Securities', marketShare: 7.35 },
  { id: 'HSC', name: 'HSC', fullName: 'Ho Chi Minh City Securities', marketShare: 7.30 },
  { id: 'MBS', name: 'MBS', fullName: 'MB Securities', marketShare: 5.29 },
  { id: 'VND', name: 'VND', fullName: 'VNDIRECT Securities', marketShare: 4.78 },
  { id: 'KIS', name: 'KIS', fullName: 'KIS Vietnam Securities', marketShare: 3.21 },
  { id: 'VPBANKS', name: 'VPBankS', fullName: 'VPBank Securities', marketShare: 2.94 },
  { id: 'VCBS', name: 'VCBS', fullName: 'Vietcombank Securities', marketShare: 2.87 },
  { id: 'MAS', name: 'MAS', fullName: 'Mirae Asset Securities', marketShare: 2.70 },
  { id: 'FPTS', name: 'FPTS', fullName: 'FPT Securities', marketShare: 2.50 },
  { id: 'DNSE', name: 'DNSE', fullName: 'DNSE Securities', marketShare: 2.30 },
  { id: 'BSC', name: 'BSC', fullName: 'BIDV Securities', marketShare: 2.10 },
  { id: 'ACBS', name: 'ACBS', fullName: 'ACB Securities', marketShare: 1.90 },
];

export const TOTAL_TOP_15_SHARE = 80.54;
export const OTHERS_SHARE = 100 - TOTAL_TOP_15_SHARE;
