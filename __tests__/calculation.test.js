function calculateTotal(price, quantity) {
  return price * quantity;
}

test('calculates product total correctly', () => {
  expect(calculateTotal(280, 2)).toBe(560);
});