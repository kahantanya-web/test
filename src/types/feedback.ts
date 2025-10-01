export type Answer = {
  question: string;
  answer?: string;
};

export type Feedback = {
  userName: string;
  specialistTitle: string;
  specialistAnswers: Answer[];
  newcomerTitle: string;
  newcomerAnswers: Answer[];
};

export interface FeedbackSectionProps {
  title: string;
  answers: Answer[];
  sectionKey: string;
}