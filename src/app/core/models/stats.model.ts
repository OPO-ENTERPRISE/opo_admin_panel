export interface TopicStatsData {
  total: number;
  mainTopics: number;
  subtopics: number;
  enabled: number;
  disabled: number;
}

export interface UserStatsData {
  total: number;
  enabled: number;
  disabled: number;
}

export interface AreaStats {
  areaId: number;
  areaName: string;
  topics: TopicStatsData;
  users: UserStatsData;
}
