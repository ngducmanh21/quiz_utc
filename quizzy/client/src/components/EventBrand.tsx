import './EventBrand.css';

type EventBrandProps = {
  compact?: boolean;
  className?: string;
};

export function EventBrand({ compact = false, className = '' }: EventBrandProps) {
  return (
    <div className={`event-brand ${compact ? 'event-brand-compact' : ''} ${className}`}>
      <div className="event-brand-logos">
        <img
          src="/event/partner-logos.png"
          alt="Bốn logo: Trường Đại học Giao thông Vận tải, MSD, United Way và biểu tượng chiến dịch"
        />
      </div>
      <div className="event-brand-heading">
        <span className="event-brand-kicker">TỌA ĐÀM</span>
        <h1>BÌNH ĐẲNG GIỚI</h1>
      </div>
      {!compact && (
        <p className="event-brand-quote">
          “Không đứng ngoài cuộc – Nam giới tiên phong vì môi trường học đường an toàn, bình đẳng”
        </p>
      )}
    </div>
  );
}
