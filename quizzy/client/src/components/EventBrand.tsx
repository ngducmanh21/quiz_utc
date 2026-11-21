import './EventBrand.css';

type EventBrandProps = {
  compact?: boolean;
  logosOnly?: boolean;
  className?: string;
};

export function EventBrand({ compact = false, logosOnly = false, className = '' }: EventBrandProps) {
  return (
    <div className={`event-brand ${compact ? 'event-brand-compact' : ''} ${className}`}>
      <div className="event-brand-logos">
        <img className="event-logo-utc" src="/event/utc-seal.png" alt="Trường Đại học Giao thông Vận tải" />
        <img className="event-logo-msd-uw" src="/event/msd-united-way.png" alt="MSD và United Way" />
        <span className="event-logo-gender" role="img" aria-label="Biểu tượng Tháng hành động vì bình đẳng giới">
          <img src="/event/gender-equality-symbol.jpg" alt="" />
        </span>
      </div>
      {!logosOnly && (
        <div className="event-brand-heading">
          <span className="event-brand-kicker">Tọa Đàm</span>
          <h1>BÌNH ĐẲNG GIỚI</h1>
        </div>
      )}
      {!compact && !logosOnly && (
        <p className="event-brand-quote">
          “Không đứng ngoài cuộc – Nam giới tiên phong vì môi trường học đường an toàn, bình đẳng”
        </p>
      )}
    </div>
  );
}
