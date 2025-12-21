import usePermission from "@/shared/hooks/usePermission";
import { formatDateTime } from "@/shared/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar } from "lucide-react";
import moment from "moment";
import { BiCollapseAlt, BiExpandAlt } from "react-icons/bi";

const UpdateAccordionItem = ({
  date,
  question,
  answer,
  isOpen,
  toggle
}: {
  date: string;
  question: string;
  answer: string;
  isOpen: boolean;
  toggle: () => void;
}) => {
  const { user, isUserLoading } = usePermission();
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
        {/* Question Text */}
        <div className="flex w-full flex-col items-start gap-2">
          <div className="flex items-center text-tertiary">
            <Calendar className="mr-2" size={17} />
            <span className="line-clamp-1 text-xs font-medium">
              {!isUserLoading &&
                user &&
                date &&
                moment(formatDateTime(date, user?.date_time)).format("ll")}
            </span>
          </div>
          <h3 className="text-base font-medium text-gray-800 dark:text-white">
            {question}
          </h3>
        </div>
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
            <div className="p-4 text-gray-600 dark:text-gray-400">{answer}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default UpdateAccordionItem;
