export type Participant = {
  id: string
  participant_code: string
  qr_token: string
  name: string
  school: string
  class_name: string
  whatsapp: string
  event_day: '17 Juni' | '18 Juni'
  attended: boolean
  checked_in_at: string | null
  survey_submitted: boolean
  action_plan_submitted: boolean
  certificate_status: 'not_eligible' | 'eligible' | 'viewed'
  certificate_viewed_at: string | null
  judging_status: string
  created_at: string
  updated_at: string
}

export type SurveyResponse = {
  id: string
  participant_id: string
  answers: Record<string, string>
  q1: string | null
  q2: string | null
  q3: string | null
  q4: string | null
  q5: string | null
  q6: string | null
  q7: string | null
  q8: string | null
  q9: string | null
  q10: string | null
  q11: string | null
  q12: string | null
  q13: string | null
  q14: string | null
  submitted_at: string
  participants?: Participant
}

export type SurveyQuestion = {
  id: string
  question_key: string
  label: string
  type: 'rating' | 'choice' | 'textarea'
  options: string[]
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ActionPlan = {
  id: string
  participant_id: string
  title: string
  description: string
  location: string | null
  drive_link: string | null
  social_link: string | null
  notes: string | null
  submitted_at: string
  updated_at: string
  participants?: Participant
}
