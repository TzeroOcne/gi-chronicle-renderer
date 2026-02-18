export type TeamAvatar = {
  avatar_id: number,
  name: string,
  element: string,
  image: string,
  level: number,
  rarity: number,
  rank: number,
};

export type BestAvatar = {
  avatar_id: number,
  side_icon: string,
  dps: string,
  type: number,
};

export type Monster = {
  monster_id: number,
  name: string,
  level: number,
  icon: string,
  desc: string[],
  tags: unknown[],
};

export type ChallengeDetail = {
  name: string,
  second: number,
  teams: TeamAvatar[],
  best_avatar: BestAvatar[],
  monster: Monster,
};

export type BestRecord = {
  difficulty: number,
  second: number,
  icon: string,
};

export type AttemptDetail = {
  best: BestRecord|null,
  challenge: ChallengeDetail[],
  has_data: boolean,
};

type ScheduleDateTime = {
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
};

export type ScheduleDetail = {
  schedule_id: string,
  start_time: string,
  end_time: string,
  start_date_time: ScheduleDateTime,
  end_date_time: ScheduleDateTime,
  is_valid: boolean,
  name: string,
};

export type StygianOnslaughtDetail = {
  schedule: ScheduleDetail,
  single: AttemptDetail,
  mp: AttemptDetail,
  blings: unknown[],
};
