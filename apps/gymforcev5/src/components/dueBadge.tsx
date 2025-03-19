import React from 'react';
import { Badge, Text } from 'rizzui';

type DueBadgeProps = {
  dueAmount: number | null | undefined;
  symbol?: string | null | undefined;
};

export default function getDueBadge({ dueAmount, symbol }: DueBadgeProps): JSX.Element {
  if (dueAmount === null || dueAmount === undefined) {
    return (
      <div className="flex items-center flex-nowrap">
        <Badge color="warning" renderAsDot />
        <Text className="ms-2 text-nowrap font-medium text-yellow-600">Invalid</Text>
      </div>
    );
  }

  if (dueAmount === 0) {
    return (
      <div className="flex items-center flex-nowrap">
        <Badge color="success" renderAsDot />
        <Text className="ms-2 text-nowrap font-medium text-green-dark">Paid</Text>
      </div>
    );
  }

  const amountText = `${symbol} ${new Intl.NumberFormat().format(dueAmount)}`;

  return (
    <div className="flex items-center flex-nowrap">
      <Badge color="danger" renderAsDot />
      <Text className="ms-2 text-nowrap font-medium text-red-dark">{amountText}</Text>
    </div>
  );
}