export interface TestLevel {
  id: number;
  level: number;
}

export interface Screen {
  id: number;
  screenNumber: number;
  testLevelId: number;
}

export interface Question {
  id: number;
  text: string;
  screenId: number;
  answerImageId: string | number;
}

export interface Image {
  id: number;
  url: string;
  screenId: number;
}

export interface Option {
  id: number;
  text: string;
  questionId: number;
}

export interface NewQuestionState {
  text: string;
  screenId: string;
  answerImageId: string | number | '';
}
