import { 
  Home, 
  Shield, 
  Award, 
  Landmark, 
  Building2, 
  Wallet, 
  HardHat, 
  Coins, 
  FileCheck, 
  Wrench,
  type LucideIcon 
} from 'lucide-react'

export interface FAQ {
  question: string
  answer: string
}

export interface LoanProduct {
  slug: string
  title: string
  tagline: string
  overview: string
  benefits: string[]
  whoFor: string
  faqs: FAQ[]
  icon: LucideIcon
}

export const loanProducts: LoanProduct[] = [
  {
    slug: 'conventional',
    title: 'Conventional Loans',
    tagline: 'Traditional financing with competitive rates',
    overview: 'Conventional loans are the most common mortgage type, offering flexible terms and competitive rates for borrowers with good credit. These loans are not backed by the federal government, which often means stricter qualification requirements but also potentially lower costs over the life of the loan.',
    benefits: [
      'Competitive interest rates for qualified borrowers',
      'Flexible down payment options starting at 3%',
      'No upfront mortgage insurance premium',
      'PMI can be removed once you reach 20% equity',
      'Available for primary homes, second homes, and investment properties',
    ],
    whoFor: 'Conventional loans are ideal for borrowers with good to excellent credit scores (typically 620+), stable income, and the ability to make at least a 3% down payment. They work well for those who want to avoid government loan restrictions and may have enough equity to skip mortgage insurance.',
    faqs: [
      {
        question: 'What credit score do I need for a conventional loan?',
        answer: 'Most lenders require a minimum credit score of 620 for conventional loans, though better rates are available for scores of 740 and above.',
      },
      {
        question: 'How much do I need for a down payment?',
        answer: 'Down payments can be as low as 3% for first-time homebuyers, though 5-20% is more common. Putting down 20% or more eliminates the need for private mortgage insurance (PMI).',
      },
      {
        question: 'What is PMI and when can I remove it?',
        answer: 'Private Mortgage Insurance (PMI) protects the lender if you default. You can request PMI removal once you reach 20% equity, and it automatically terminates at 22% equity.',
      },
    ],
    icon: Home,
  },
  {
    slug: 'fha',
    title: 'FHA Loans',
    tagline: 'Government-backed loans with flexible requirements',
    overview: 'FHA loans are insured by the Federal Housing Administration and designed to help first-time homebuyers and those with less-than-perfect credit achieve homeownership. With lower down payment requirements and more lenient credit standards, FHA loans make buying a home more accessible.',
    benefits: [
      'Down payments as low as 3.5%',
      'Credit scores as low as 580 accepted',
      'More lenient debt-to-income ratio requirements',
      'Gift funds allowed for entire down payment',
      'Competitive interest rates regardless of credit',
    ],
    whoFor: 'FHA loans are perfect for first-time homebuyers, those rebuilding credit after financial difficulties, or anyone who needs a lower down payment option. They are especially helpful for borrowers who may not qualify for conventional financing.',
    faqs: [
      {
        question: 'What is the minimum credit score for an FHA loan?',
        answer: 'With a 10% down payment, you may qualify with a credit score as low as 500. With 3.5% down, the minimum score is typically 580.',
      },
      {
        question: 'Do FHA loans have mortgage insurance?',
        answer: 'Yes, FHA loans require both an upfront mortgage insurance premium (UFMIP) of 1.75% and an annual mortgage insurance premium (MIP) that varies based on loan terms.',
      },
      {
        question: 'Can I use an FHA loan for a second home?',
        answer: 'No, FHA loans are only available for primary residences. You must intend to live in the home as your main residence.',
      },
    ],
    icon: Shield,
  },
  {
    slug: 'va',
    title: 'VA Loans',
    tagline: 'Honoring service with exceptional benefits',
    overview: 'VA loans are a benefit earned by military service members, veterans, and eligible surviving spouses. Guaranteed by the U.S. Department of Veterans Affairs, these loans offer some of the best terms available in the mortgage market, including no down payment and no private mortgage insurance.',
    benefits: [
      'No down payment required',
      'No private mortgage insurance (PMI)',
      'Competitive interest rates',
      'Limited closing costs',
      'No prepayment penalties',
      'Assumable loans',
    ],
    whoFor: 'VA loans are available to active-duty service members, veterans, National Guard and Reserve members, and certain surviving spouses. Eligibility is determined by length of service and discharge conditions.',
    faqs: [
      {
        question: 'Who is eligible for a VA loan?',
        answer: 'Eligibility includes active-duty service members (90+ continuous days), veterans (90 days wartime or 181 days peacetime), National Guard/Reserve members (6+ years or 90 days active duty), and certain surviving spouses.',
      },
      {
        question: 'Is there a VA loan limit?',
        answer: 'For borrowers with full entitlement, there is no loan limit. Those with reduced entitlement may have limits based on their county.',
      },
      {
        question: 'What is the VA funding fee?',
        answer: 'The VA funding fee is a one-time payment that helps fund the program. It ranges from 1.25% to 3.3% depending on your service, down payment, and whether it is your first VA loan. Some veterans are exempt.',
      },
    ],
    icon: Award,
  },
  {
    slug: 'usda',
    title: 'USDA Loans',
    tagline: 'Rural homeownership made possible',
    overview: 'USDA loans are backed by the U.S. Department of Agriculture and designed to help low-to-moderate income borrowers purchase homes in eligible rural and suburban areas. With no down payment required and reduced mortgage insurance, USDA loans make homeownership achievable for many who thought it was out of reach.',
    benefits: [
      'No down payment required',
      'Lower mortgage insurance than FHA',
      'Below-market interest rates',
      'Flexible credit requirements',
      'Closing costs can be financed or paid by seller',
    ],
    whoFor: 'USDA loans are for borrowers purchasing primary residences in eligible rural areas who meet income limits (typically up to 115% of area median income). The property location is key to eligibility.',
    faqs: [
      {
        question: 'What areas qualify for USDA loans?',
        answer: 'USDA loans are available in rural areas and many suburban communities. Approximately 97% of U.S. land mass is eligible. Use the USDA eligibility map to check specific addresses.',
      },
      {
        question: 'What are the income limits?',
        answer: 'Household income generally cannot exceed 115% of the area median income. Limits vary by location and household size.',
      },
      {
        question: 'Does USDA require mortgage insurance?',
        answer: 'Yes, but USDA mortgage insurance is lower than FHA. There is a 1% upfront guarantee fee and a 0.35% annual fee.',
      },
    ],
    icon: Landmark,
  },
  {
    slug: 'jumbo',
    title: 'Jumbo Loans',
    tagline: 'Financing for high-value properties',
    overview: 'Jumbo loans exceed the conforming loan limits set by Fannie Mae and Freddie Mac, making them essential for purchasing luxury homes or properties in high-cost markets. While requirements are stricter, jumbo loans provide the financing needed for your dream home.',
    benefits: [
      'Finance homes above conforming loan limits',
      'Competitive rates for well-qualified borrowers',
      'Various term options available',
      'Can be used for primary, secondary, or investment properties',
      'Interest-only options may be available',
    ],
    whoFor: 'Jumbo loans are designed for borrowers purchasing high-value properties that exceed conforming loan limits. They require excellent credit (typically 700+), substantial down payments (10-20%+), and significant cash reserves.',
    faqs: [
      {
        question: 'What is the conforming loan limit?',
        answer: 'For 2024, the conforming loan limit is $766,550 in most areas, and up to $1,149,825 in high-cost areas. Loans exceeding these limits are considered jumbo.',
      },
      {
        question: 'What credit score do I need for a jumbo loan?',
        answer: 'Most jumbo lenders require a minimum credit score of 700, with the best rates available for scores of 740 and above.',
      },
      {
        question: 'How much down payment is required?',
        answer: 'Jumbo loans typically require 10-20% down, though some lenders may require more for very high loan amounts.',
      },
    ],
    icon: Building2,
  },
  {
    slug: 'heloc',
    title: 'HELOC',
    tagline: 'Tap into your home equity flexibly',
    overview: 'A Home Equity Line of Credit (HELOC) allows you to borrow against the equity in your home as needed, similar to a credit card. With a draw period followed by a repayment period, HELOCs offer flexible access to funds for renovations, debt consolidation, education, or other major expenses.',
    benefits: [
      'Borrow only what you need, when you need it',
      'Interest-only payments during draw period',
      'Potential tax deductibility for home improvements',
      'Lower rates than credit cards or personal loans',
      'Revolving credit line you can reuse',
    ],
    whoFor: 'HELOCs are ideal for homeowners with significant equity who need flexible access to funds over time. They work well for ongoing projects, emergency funds, or expenses where the total amount is uncertain.',
    faqs: [
      {
        question: 'How much can I borrow with a HELOC?',
        answer: 'Most lenders allow you to borrow up to 80-85% of your home equity. For example, if your home is worth $400,000 and you owe $200,000, you may be able to access up to $120,000-$140,000.',
      },
      {
        question: 'What is the draw period?',
        answer: 'The draw period is typically 5-10 years when you can borrow against your line of credit. After that, the repayment period (usually 10-20 years) begins.',
      },
      {
        question: 'Are HELOC interest rates variable?',
        answer: 'Most HELOCs have variable rates tied to the prime rate. Some lenders offer fixed-rate options or the ability to lock portions of your balance.',
      },
    ],
    icon: Wallet,
  },
  {
    slug: 'construction-permanent',
    title: 'Construction-Permanent',
    tagline: 'Build your dream home with one loan',
    overview: 'Construction-permanent loans (also called construction-to-permanent or C2P loans) combine construction financing and a permanent mortgage into a single loan. This streamlined approach means one application, one closing, and one set of closing costs for both building and financing your new home.',
    benefits: [
      'Single loan for construction and permanent financing',
      'One closing reduces costs and paperwork',
      'Lock in your permanent rate before construction begins',
      'Interest-only payments during construction',
      'Seamless transition to permanent mortgage',
    ],
    whoFor: 'Construction-permanent loans are perfect for borrowers building a custom home on land they own or are purchasing. They are ideal for those who want the simplicity of a single loan and the security of locking in their permanent rate upfront.',
    faqs: [
      {
        question: 'How do construction draws work?',
        answer: 'Funds are disbursed in stages (draws) as construction progresses. An inspector verifies work completion before each draw is released to the builder.',
      },
      {
        question: 'What down payment is required?',
        answer: 'Down payments typically range from 10-20% of the total project cost, which includes land, construction, and any contingencies.',
      },
      {
        question: 'Can I be my own general contractor?',
        answer: 'Some lenders allow owner-builders, but most require a licensed general contractor. Requirements vary by lender and loan program.',
      },
    ],
    icon: HardHat,
  },
  {
    slug: 'hard-money-private',
    title: 'Hard Money & Private',
    tagline: 'Fast, flexible financing solutions',
    overview: 'Hard money and private loans provide quick financing based primarily on collateral value rather than borrower qualifications. These asset-based loans are ideal for real estate investors, fix-and-flip projects, or borrowers who need fast closings or do not qualify for traditional financing.',
    benefits: [
      'Fast approval and funding (days, not weeks)',
      'Asset-based approval focuses on property value',
      'Flexible qualification requirements',
      'Ideal for investment properties and flips',
      'Short-term financing for time-sensitive deals',
    ],
    whoFor: 'Hard money loans serve real estate investors, house flippers, developers, and borrowers needing bridge financing. They are also valuable for those with credit challenges who have substantial equity or a profitable investment opportunity.',
    faqs: [
      {
        question: 'How fast can I get funded?',
        answer: 'Hard money loans can close in as little as 5-10 days, compared to 30-45 days for conventional loans. Speed depends on property appraisal and documentation.',
      },
      {
        question: 'What are typical hard money rates?',
        answer: 'Interest rates typically range from 8-15%, with 1-5 points (origination fees). Rates vary based on loan-to-value ratio, property type, and borrower experience.',
      },
      {
        question: 'What is the typical loan term?',
        answer: 'Hard money loans are usually short-term, ranging from 6 months to 3 years. They are designed as bridge financing until you refinance or sell the property.',
      },
    ],
    icon: Coins,
  },
  {
    slug: 'portfolio-non-qm',
    title: 'Portfolio & Non-QM',
    tagline: 'Solutions beyond traditional guidelines',
    overview: 'Portfolio and Non-QM (Non-Qualified Mortgage) loans are held by lenders rather than sold to government agencies, allowing for flexible underwriting. These loans serve borrowers who do not fit traditional qualification criteria but have strong compensating factors.',
    benefits: [
      'Bank statement income documentation',
      'Asset depletion/asset-based qualifying',
      'Recent credit events considered',
      'Interest-only options available',
      'Higher debt-to-income ratios allowed',
    ],
    whoFor: 'Portfolio and Non-QM loans help self-employed borrowers, real estate investors, those with recent credit events, foreign nationals, and others who cannot document income traditionally or do not meet agency guidelines.',
    faqs: [
      {
        question: 'What is bank statement income?',
        answer: 'Instead of tax returns, lenders analyze 12-24 months of bank statements to calculate income. This benefits self-employed borrowers who write off significant expenses.',
      },
      {
        question: 'Can I qualify after bankruptcy or foreclosure?',
        answer: 'Yes, many Non-QM programs allow qualification shortly after credit events, sometimes even one day out from discharge, with appropriate down payment and compensating factors.',
      },
      {
        question: 'What is asset depletion?',
        answer: 'Asset depletion uses your liquid assets to qualify by dividing them over the loan term to create imputed income. This helps retirees or those with significant savings.',
      },
    ],
    icon: FileCheck,
  },
  {
    slug: 'renovation-rehab',
    title: 'Renovation & Rehab',
    tagline: 'Finance your home improvements',
    overview: 'Renovation and rehab loans combine home purchase or refinance with improvement costs in a single mortgage. Whether you are buying a fixer-upper or updating your current home, these loans provide the financing to transform any property into your ideal living space.',
    benefits: [
      'One loan for purchase/refinance plus improvements',
      'Borrow based on after-renovation value',
      'Finance major structural changes or cosmetic updates',
      'Lower rates than home equity or personal loans',
      'FHA 203(k) and conventional options available',
    ],
    whoFor: 'Renovation loans serve buyers purchasing homes that need work, homeowners wanting to upgrade, and investors looking to improve and hold rental properties. They are ideal when you want to finance improvements at mortgage rates.',
    faqs: [
      {
        question: 'What is an FHA 203(k) loan?',
        answer: 'The FHA 203(k) is a government-backed renovation loan with lower down payments (3.5%) and flexible credit requirements. Limited 203(k) covers up to $35,000 in repairs; Standard 203(k) has no limit.',
      },
      {
        question: 'How are renovation funds disbursed?',
        answer: 'Funds are held in escrow and released in draws as work is completed and inspected. This protects both you and the lender throughout the project.',
      },
      {
        question: 'Can I do the work myself?',
        answer: 'DIY work is limited on most renovation loans. Major work typically requires licensed contractors, though some cosmetic improvements may allow owner labor.',
      },
    ],
    icon: Wrench,
  },
]

export function getLoanProduct(slug: string): LoanProduct | undefined {
  return loanProducts.find(product => product.slug === slug)
}
