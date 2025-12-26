import { FadeIn } from "./YearEnd2025";

const SectionHeader = ({
  tag,
  title,
  description,
  subtitle,
  tagColor = "text-indigo-600",
  tagBg = "bg-indigo-50",
  tagBorder = "border-indigo-200",
  titleColor = "text-slate-900",
  descriptionColor = "text-slate-600",
  className = "",
  icon
}: {
  tag?: string;
  title: string;
  description?: string;
  subtitle?: string;
  tagColor?: string;
  tagBg?: string;
  tagBorder?: string;
  titleColor?: string;
  descriptionColor?: string;
  className?: string;
  icon?: React.ElementType;
}) => (
  <div
    className={`mx-auto mb-8 max-w-xs px-4 text-center sm:mb-12 sm:max-w-lg sm:px-6 md:max-w-2xl lg:mb-16 lg:max-w-3xl ${className}`}
  >
    <FadeIn>
      {tag && (
        <div
          className={`mb-3 inline-flex items-center gap-1.5 rounded-full border sm:mb-4 sm:gap-2 ${tagBorder} ${tagBg} px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide sm:px-3 sm:py-1.5 sm:text-xs ${tagColor}`}
        >
          {icon && (
            <span className="relative flex h-1.5 w-1.5 sm:h-2 sm:w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75"></span>
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current sm:h-2 sm:w-2"></span>
            </span>
          )}
          {tag}
        </div>
      )}
      <h2
        className={`mb-1.5 text-[10px] font-bold uppercase tracking-widest sm:mb-2 sm:text-xs ${tagColor}`}
      >
        {subtitle}
      </h2>
      <h3
        className={`mb-4 text-2xl font-black leading-tight sm:mb-5 sm:text-3xl md:text-4xl lg:mb-6 lg:text-4xl xl:text-5xl ${titleColor}`}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`text-sm font-medium leading-relaxed sm:text-base lg:text-lg ${descriptionColor}`}
        >
          {description}
        </p>
      )}
    </FadeIn>
  </div>
);
export default SectionHeader;
