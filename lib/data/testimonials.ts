export interface Testimonial {
  quote: string
  author: string
  location: string
  loanType?: string
}

export const testimonials: Testimonial[] = [
  {
    quote: "Bay to Bay made our first home purchase feel effortless. They guided us through every step and found us a rate we never thought possible. We are forever grateful!",
    author: "Sarah & Michael T.",
    location: "Tampa, FL",
    loanType: "First-Time Homebuyers",
  },
  {
    quote: "After being turned down by two other lenders, Bay to Bay found a solution that worked for my unique situation. Professional, responsive, and genuinely caring about their clients.",
    author: "James R.",
    location: "St. Petersburg, FL",
    loanType: "Self-Employed Borrower",
  },
  {
    quote: "The refinance process was incredibly smooth. They saved us over $400 per month and handled everything from start to finish. Highly recommend!",
    author: "The Martinez Family",
    location: "Clearwater, FL",
    loanType: "Refinance",
  },
]
