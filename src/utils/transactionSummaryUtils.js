export function getPersonSummaryStatus(person, data) {
  const lendRemaining = data.lend - data.received;
  const borrowRemaining = data.borrowed - data.repay;
  let message = "";
  let icon = null;
  let color = "";

  if (lendRemaining === 0 && borrowRemaining === 0) {
    message = "All settled!";
    icon = "✅";
    color = "green";
  } else if (borrowRemaining < lendRemaining) {
    message = `${person} should pay you Rs ${lendRemaining - borrowRemaining}`;
    icon = "💰";
    color = "blue";
  } else if (borrowRemaining > lendRemaining) {
    message = `You should pay Rs ${
      borrowRemaining - lendRemaining
    } to ${person}`;
    icon = "💸";
    color = "yellow";
  } else if (lendRemaining === borrowRemaining) {
    message = `${person} and you have equal lend and borrow amounts.`;
    icon = "🤝";
    color = "gray";
  }

  return { message, icon, color, lendRemaining, borrowRemaining };
}
