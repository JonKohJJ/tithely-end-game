"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

interface FAQItem {
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all unused items in their original packaging.",
  },
  {
    question: "How long does shipping take?",
    answer: "Shipping typically takes 3-5 business days for domestic orders and 7-14 days for international orders.",
  },
  {
    question: "Do you offer international shipping?",
    answer:
      "Yes, we ship to most countries worldwide. Shipping costs and delivery times may vary depending on the destination.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order is shipped, you'll receive a tracking number via email. You can use this number to track your package on our website.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and Apple Pay.",
  },
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
        <div className="pb-4">
          <p className="fs-h3">{answer}</p>
        </div>
      </div>
    </div>
  )
}

