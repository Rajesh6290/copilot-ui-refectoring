import { AnimatePresence, motion } from "framer-motion";
import { BiCollapseAlt, BiExpandAlt } from "react-icons/bi";

type AccordionItemProps = {
  id: string;
  question: string;
  answer: string;
  isCompleted?: boolean;
  isOpen: boolean;
  toggle: () => void;
};
const AccordionItem = ({
  question,
  answer,
  isOpen,
  toggle
}: AccordionItemProps) => {
  const variants = {
    open: {
      height: "auto",
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, ease: "easeInOut" }
      }
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, ease: "easeInOut" }
      }
    }
  };

  return (
    <div className="border-b border-neutral-300 last:border-b-0 dark:border-neutral-600">
      <div
        tabIndex={0}
        role="button"
        className="flex w-full cursor-pointer items-center justify-between p-4"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (toggle) {
              toggle();
            }
          }
        }}
      >
        <div className="flex items-center">
          {/* Indicator (Checkmark or Cross) */}
          {/* {isCompleted ? (
            <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full">
              <CircleHelp size={22} className="text-teal-500" />
            </div>
          ) : (
            <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </div>
          )} */}
          {/* Question Text */}
          <h3 className="text-base font-medium text-gray-800 dark:text-white">
            {question}
          </h3>
        </div>
        {/* Plus Icon with Rotation Animation */}
        {isOpen ? (
          <motion.div transition={{ duration: 0.2, ease: "easeInOut" }}>
            <BiCollapseAlt className="h-5 w-5 text-gray-700" />
          </motion.div>
        ) : (
          <motion.div transition={{ duration: 0.2, ease: "easeInOut" }}>
            <BiExpandAlt className="h-5 w-5 text-gray-700" />
          </motion.div>
        )}
      </div>
      {/* Answer Section with Framer Motion Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={variants}
            initial="closed"
            animate="open"
            exit="closed"
            className="overflow-hidden bg-white dark:bg-darkSidebarBackground"
          >
            <div className="p-4 text-gray-600 dark:text-gray-400">
              {answer || "Not Provided"}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default AccordionItem;
