import classNames from "classnames";

interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    className: string;
    testId?: string;
    type?: "submit" | "button" | "reset";
}
export const Button: React.FC<ButtonProps> = ({
    children, 
    onClick, 
    testId,
    className,
    type= "submit",
}) => {
    return (
        <button 
            type={type}
            data-testid={testId}
            onClick={onClick} 
            className={classNames(
                "bg-slate-500 px-4 rounded-full text-xl hover:bg-slate-600 text-white", 
                className
            )}>
            {children}
        </button>
    );
}