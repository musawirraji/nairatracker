export interface Goal {
  id:      string;
  user_id: string;
  target:  number;
  year:    number;
}

export const goalService = {
  progress:  (saved: number, target: number) => Math.min((saved / target) * 100, 100),
  isOnTrack: (projected: number, target: number) => projected >= target,
  gap:       (projected: number, target: number) => Math.max(target - projected, 0),
};
