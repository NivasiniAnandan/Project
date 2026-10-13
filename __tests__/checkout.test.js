function calculateFinalTotal(price, quantity, shipping) {
  return (price * quantity) + shipping;
}

test('calculates final order total correctly', () => {
  expect(calculateFinalTotal(280, 2, 50)).toBe(610);
});