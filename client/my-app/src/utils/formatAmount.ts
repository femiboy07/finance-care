
export function formatAmount(figure:number){
      const amount = figure;
   
  const formatted = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
}).format(amount);
  return formatted;
}