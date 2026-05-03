export interface SecurityFirm {
  id: string;
  name: string;
  fullName: string;
  marketShare: number; // Q1 2026 HOSE market share (%)
  facebookUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
}

export const TOP_15_FIRMS: SecurityFirm[] = [
  { id: 'VPS', name: 'VPS', fullName: 'VPS Securities', marketShare: 15.32, facebookUrl: 'https://facebook.com/vps.securities', tiktokUrl: 'https://tiktok.com/@vps.securities', youtubeUrl: 'https://youtube.com/@vpssecurities' },
  { id: 'SSI', name: 'SSI', fullName: 'SSI Securities', marketShare: 11.14, facebookUrl: 'https://facebook.com/ssi.com.vn', tiktokUrl: 'https://tiktok.com/@ssi.securities', youtubeUrl: 'https://youtube.com/@ssisecurities' },
  { id: 'TCBS', name: 'TCBS', fullName: 'Techcom Securities', marketShare: 8.85, facebookUrl: 'https://facebook.com/tcbs.com.vn', tiktokUrl: 'https://tiktok.com/@tcbs_official', youtubeUrl: 'https://youtube.com/@tcbs_official' },
  { id: 'VCI', name: 'VCI', fullName: 'Vietcap Securities', marketShare: 7.35, facebookUrl: 'https://facebook.com/vietcapsecurities', tiktokUrl: 'https://tiktok.com/@vietcap', youtubeUrl: 'https://youtube.com/@vietcap' },
  { id: 'HSC', name: 'HSC', fullName: 'Ho Chi Minh City Securities', marketShare: 7.30, facebookUrl: 'https://facebook.com/hscsecurities', tiktokUrl: 'https://tiktok.com/@hsc_official', youtubeUrl: 'https://youtube.com/@hscsecurities' },
  { id: 'MBS', name: 'MBS', fullName: 'MB Securities', marketShare: 5.29, facebookUrl: 'https://facebook.com/mbs.securities', tiktokUrl: 'https://tiktok.com/@mbs_securities', youtubeUrl: 'https://youtube.com/@mbssecurities' },
  { id: 'VND', name: 'VND', fullName: 'VNDIRECT Securities', marketShare: 4.78, facebookUrl: 'https://facebook.com/vndirect', tiktokUrl: 'https://tiktok.com/@vndirect_official', youtubeUrl: 'https://youtube.com/@vndirect' },
  { id: 'KIS', name: 'KIS', fullName: 'KIS Vietnam Securities', marketShare: 3.21, facebookUrl: 'https://facebook.com/kisvietnam', tiktokUrl: 'https://tiktok.com/@kisvietnam', youtubeUrl: 'https://youtube.com/@kisvietnam' },
  { id: 'VPBANKS', name: 'VPBankS', fullName: 'VPBank Securities', marketShare: 2.94, facebookUrl: 'https://facebook.com/vpbanksecurities', tiktokUrl: 'https://tiktok.com/@vpbanksecurities', youtubeUrl: 'https://youtube.com/@vpbanksecurities' },
  { id: 'VCBS', name: 'VCBS', fullName: 'Vietcombank Securities', marketShare: 2.87, facebookUrl: 'https://facebook.com/vcbs.com.vn', tiktokUrl: 'https://tiktok.com/@vcbs_official', youtubeUrl: 'https://youtube.com/@vcbs_official' },
  { id: 'MAS', name: 'MAS', fullName: 'Mirae Asset Securities', marketShare: 2.70, facebookUrl: 'https://facebook.com/miraeassetsecurities', tiktokUrl: 'https://tiktok.com/@miraeasset', youtubeUrl: 'https://youtube.com/@miraeasset' },
  { id: 'FPTS', name: 'FPTS', fullName: 'FPT Securities', marketShare: 2.50, facebookUrl: 'https://facebook.com/fptsecurities', tiktokUrl: 'https://tiktok.com/@fpts_official', youtubeUrl: 'https://youtube.com/@fptsecurities' },
  { id: 'DNSE', name: 'DNSE', fullName: 'DNSE Securities', marketShare: 2.30, facebookUrl: 'https://facebook.com/dnse.securities', tiktokUrl: 'https://tiktok.com/@dnse_official', youtubeUrl: 'https://youtube.com/@dnse_official' },
  { id: 'BSC', name: 'BSC', fullName: 'BIDV Securities', marketShare: 2.10, facebookUrl: 'https://facebook.com/bidvsecurities', tiktokUrl: 'https://tiktok.com/@bsc_securities', youtubeUrl: 'https://youtube.com/@bidvsecurities' },
  { id: 'ACBS', name: 'ACBS', fullName: 'ACB Securities', marketShare: 1.90, facebookUrl: 'https://facebook.com/acbsecurities', tiktokUrl: 'https://tiktok.com/@acbs_official', youtubeUrl: 'https://youtube.com/@acbsecurities' },
];

export const TOTAL_TOP_15_SHARE = 80.54;
export const OTHERS_SHARE = 100 - TOTAL_TOP_15_SHARE;
