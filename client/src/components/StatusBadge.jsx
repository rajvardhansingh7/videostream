import {
    FiCheckCircle,
    FiAlertTriangle,
    FiLoader,
    FiClock,
    FiXCircle
} from 'react-icons/fi';

const StatusBadge = ({ status, size = 'md', showIcon = true }) => {
    const sizeClasses = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base'
    };

    const iconSizes = {
        sm: 'w-3 h-3',
        md: 'w-4 h-4',
        lg: 'w-5 h-5'
    };

    const getStatusConfig = () => {
        switch (status) {
            case 'safe':
                return {
                    label: 'Safe',
                    icon: FiCheckCircle,
                    className: 'status-safe'
                };
            case 'flagged':
                return {
                    label: 'Flagged',
                    icon: FiAlertTriangle,
                    className: 'status-flagged'
                };
            case 'processing':
                return {
                    label: 'Processing',
                    icon: FiLoader,
                    className: 'status-processing',
                    animate: true
                };
            case 'pending':
                return {
                    label: 'Pending',
                    icon: FiClock,
                    className: 'status-pending'
                };
            case 'error':
                return {
                    label: 'Error',
                    icon: FiXCircle,
                    className: 'status-error'
                };
            default:
                return {
                    label: status || 'Unknown',
                    icon: FiClock,
                    className: 'status-pending'
                };
        }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <span className={`
      inline-flex items-center space-x-1.5 rounded-full font-medium
      ${sizeClasses[size]}
      ${config.className}
    `}>
            {showIcon && (
                <Icon className={`${iconSizes[size]} ${config.animate ? 'animate-spin' : ''}`} />
            )}
            <span>{config.label}</span>
        </span>
    );
};

export default StatusBadge;
