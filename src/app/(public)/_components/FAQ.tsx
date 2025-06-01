"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is this application, and how does it help me?",
    answer: "Our platform is a finance tracking and budgeting tool designed to help you monitor your income, track expenses, set savings goals, and gain insights into your financial habits."
  },
  {
    question: "Is there a free trial available?",
    answer: "Currently, we do not offer a free trial. However, we are developing a 'Demo Mode' that will allow users to explore the platform before subscribing."
  },
  {
    question: "What pricing plans do you offer?",
    answer: "We offer both a monthly subscription plan and a one-time payment option. Please refer to the pricing section above for more details."
  },
  {
    question: "Can I connect my bank accounts?",
    answer: "No, at this time, our platform does not support direct bank account integration."
  },
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. We use encryption and industry-standard security measures to ensure your financial data remains safe and private."
  },
  {
    question: "Can I export my financial data?",
    answer: "Currently, exporting financial data is not available, but this feature is in development."
  },
  {
    question: "How do I cancel my subscription?",
    answer: "You can cancel your subscription anytime through your account settings. Your access to premium features will remain active until the end of the billing cycle."
  },
  {
    question: "Can I access my data on multiple devices?",
    answer: "Yes, your data syncs across all your devices, allowing you to view your financial information anywhere. However, actions such as editing or adding transactions can only be performed on larger devices."
  },
  {
    question: "Do you offer customer support?",
    answer: "For any inquiries or support, you can reach out directly to the owner at jonathan.koh75@gmail.com."
  }
]



interface AccordionItemProps {
  question: string
  answer: string
  isOpen: boolean
  onClick: () => void
}

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number>(-1)

  function handleToggle(index: number): void {
    setOpenIndex((prevIndex) => (prevIndex === index ? -1 : index))
  }

  return (
    <section className="mysection">
      <div className="mycontainer">
        <div className="flex flex-col md:flex-row md:justify-between gap-10 md:gap-20">
          <div className="md:w-1/3">
            <p className="mb-4 fs-h2">Frequently Asked Questions</p>
            <p className="">Find answers to common questions about our products and services.</p>
          </div>
          <div className="md:w-2/3">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={index === openIndex}
                onClick={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>

  )
}

function AccordionItem({ question, answer, isOpen, onClick }: AccordionItemProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState<number>(0)

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    } else {
      setHeight(0)
    }
  }, [isOpen])

  return (
    <div className="border-b border-color-border">
      <button
        className="flex w-full justify-between items-center py-4 text-left"
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <p>{question}</p>
        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>
      <div
        ref={contentRef}
        style={{ maxHeight: `${height}px` }}
        className="overflow-hidden transition-all duration-300 ease-in-out"
      >
        <div className="pb-10">
          <p className="fs-h3">{answer}</p>
        </div>
      </div>
    </div>
  )
}

