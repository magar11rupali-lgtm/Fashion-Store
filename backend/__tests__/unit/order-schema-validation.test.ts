import orderSchema from '../../src/api/order/content-types/order/schema.json';

describe('Order Schema Validation', () => {
  describe('order_status field', () => {
    it('should have order_status field defined', () => {
      expect(orderSchema.attributes.order_status).toBeDefined();
    });

    it('should be of type enumeration', () => {
      expect(orderSchema.attributes.order_status.type).toBe('enumeration');
    });

    it('should be required', () => {
      expect(orderSchema.attributes.order_status.required).toBe(true);
    });

    it('should have default value of "pending"', () => {
      expect(orderSchema.attributes.order_status.default).toBe('pending');
    });

    it('should accept valid status values', () => {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      const schemaEnum = orderSchema.attributes.order_status.enum;

      validStatuses.forEach(status => {
        expect(schemaEnum).toContain(status);
      });
    });

    it('should only contain the five valid status values', () => {
      const expectedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      const schemaEnum = orderSchema.attributes.order_status.enum;

      expect(schemaEnum).toHaveLength(5);
      expect(schemaEnum.sort()).toEqual(expectedStatuses.sort());
    });

    it('should reject invalid status values (not in enum)', () => {
      const invalidStatuses = ['completed', 'failed', 'refunded', 'on-hold', 'invalid'];
      const schemaEnum = orderSchema.attributes.order_status.enum;

      invalidStatuses.forEach(status => {
        expect(schemaEnum).not.toContain(status);
      });
    });
  });

  describe('order schema structure', () => {
    it('should have all required fields defined', () => {
      expect(orderSchema.attributes.orderNumber).toBeDefined();
      expect(orderSchema.attributes.items).toBeDefined();
      expect(orderSchema.attributes.customer).toBeDefined();
      expect(orderSchema.attributes.order_status).toBeDefined();
    });

    it('should have orderNumber as required and unique', () => {
      expect(orderSchema.attributes.orderNumber.required).toBe(true);
      expect(orderSchema.attributes.orderNumber.unique).toBe(true);
    });

    it('should have customer field as required JSON type', () => {
      expect(orderSchema.attributes.customer.type).toBe('json');
      expect(orderSchema.attributes.customer.required).toBe(true);
    });
  });
});
