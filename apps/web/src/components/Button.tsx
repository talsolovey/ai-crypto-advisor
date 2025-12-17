type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  pressed?: boolean;
  variant?: "default" | "primary";
};

export default function Button({ pressed, variant = "default", className, ...rest }: Props) {
  const classes = [
    "btn",
    variant === "primary" ? "btnPrimary" : "",
    pressed ? "btnPressed" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return <button className={classes} {...rest} />;
}
