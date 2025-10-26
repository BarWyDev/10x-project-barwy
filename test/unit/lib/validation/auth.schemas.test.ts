/**
 * Kompleksowe testy jednostkowe - walidacja schematów autentykacji
 * 
 * Best practices zastosowane:
 * - Descriptive describe blocks z kontekstem
 * - Arrange-Act-Assert pattern
 * - Comprehensive edge cases handling
 * - Explicit assertion messages
 * - TypeScript type safety
 * - Business rules validation
 */

import { describe, it, expect, expectTypeOf } from 'vitest';
import { 
  loginSchema, 
  registerSchema, 
  forgotPasswordSchema, 
  resetPasswordSchema,
  type LoginFormData,
  type RegisterFormData,
  type ForgotPasswordFormData,
  type ResetPasswordFormData
} from '@/lib/validation/auth.schemas';

describe('auth.schemas', () => {
  describe('loginSchema', () => {
    describe('valid scenarios', () => {
      it('should validate correct login data with standard email', () => {
        // Arrange
        const validData = {
          email: 'test@example.com',
          password: 'password123',
        };

        // Act
        const result = loginSchema.safeParse(validData);

        // Assert
        expect(result.success, 'Standard email and password should pass').toBe(true);
        if (result.success) {
          expectTypeOf(result.data).toMatchTypeOf<LoginFormData>();
        }
      });

      it('should validate minimum password length (6 characters)', () => {
        // Arrange
        const validData = {
          email: 'user@test.pl',
          password: '123456',
        };

        // Act
        const result = loginSchema.safeParse(validData);

        // Assert
        expect(result.success, 'Minimum 6 character password should pass').toBe(true);
      });

      it('should accept complex email formats', () => {
        // Arrange
        const complexEmails = [
          'user+tag@example.com',
          'first.last@subdomain.example.co.uk',
          'user_name@test-domain.com',
          'test@domain.co',
        ];

        // Act & Assert
        complexEmails.forEach(email => {
          const result = loginSchema.safeParse({
            email,
            password: 'validpassword',
          });
          expect(result.success, `Complex email ${email} should be valid`).toBe(true);
        });
      });

      it('should accept special characters in password', () => {
        // Arrange
        const specialPasswords = [
          'Pass@word123!',
          'p@ssw#rd$',
          'test-pass_word.123',
        ];

        // Act & Assert
        specialPasswords.forEach(password => {
          const result = loginSchema.safeParse({
            email: 'test@example.com',
            password,
          });
          expect(result.success, `Password with special chars should be valid`).toBe(true);
        });
      });
    });

    describe('email validation', () => {
      it('should reject empty email', () => {
        // Arrange
        const invalidData = {
          email: '',
          password: 'password123',
        };

        // Act
        const result = loginSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Empty email should fail').toBe(false);
        if (!result.success) {
          const emailError = result.error.issues.find(i => i.path.includes('email'));
          expect(emailError?.message).toBe('Email jest wymagany');
        }
      });

      it('should reject invalid email formats', () => {
        // Arrange
        const invalidEmails = [
          'not-an-email',
          '@example.com',
          'user@',
          'user@domain',
          'user domain@example.com',
          'user@domain .com',
          'user@@example.com',
        ];

        // Act & Assert
        invalidEmails.forEach(email => {
          const result = loginSchema.safeParse({
            email,
            password: 'validpassword',
          });
          expect(result.success, `Invalid email "${email}" should fail`).toBe(false);
          if (!result.success) {
            const emailError = result.error.issues.find(i => i.path.includes('email'));
            expect(emailError?.message).toBe('Nieprawidłowy format email');
          }
        });
      });

      it('should reject email with only whitespace', () => {
        // Arrange
        const invalidData = {
          email: '   ',
          password: 'password123',
        };

        // Act
        const result = loginSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Whitespace-only email should fail').toBe(false);
      });
    });

    describe('password validation', () => {
      it('should reject empty password', () => {
        // Arrange
        const invalidData = {
          email: 'test@example.com',
          password: '',
        };

        // Act
        const result = loginSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Empty password should fail').toBe(false);
        if (!result.success) {
          const passwordError = result.error.issues.find(i => i.path.includes('password'));
          expect(passwordError?.message).toBe('Hasło jest wymagane');
        }
      });

      it('should reject password shorter than 6 characters', () => {
        // Arrange
        const shortPasswords = ['1', '12', '123', '1234', '12345'];

        // Act & Assert
        shortPasswords.forEach(password => {
          const result = loginSchema.safeParse({
            email: 'test@example.com',
            password,
          });
          expect(result.success, `Password "${password}" (${password.length} chars) should fail`).toBe(false);
          if (!result.success) {
            const passwordError = result.error.issues.find(i => i.path.includes('password'));
            expect(passwordError?.message).toBe('Hasło musi mieć co najmniej 6 znaków');
          }
        });
      });
    });

    describe('missing fields', () => {
      it('should reject completely empty object', () => {
        // Arrange
        const invalidData = {};

        // Act
        const result = loginSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Empty object should fail validation').toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
          const paths = result.error.issues.map(i => i.path[0]);
          expect(paths).toContain('email');
          expect(paths).toContain('password');
        }
      });

      it('should reject missing email field', () => {
        // Arrange
        const invalidData = {
          password: 'password123',
        };

        // Act
        const result = loginSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Missing email field should fail').toBe(false);
        if (!result.success) {
          const emailError = result.error.issues.find(i => i.path.includes('email'));
          expect(emailError).toBeDefined();
        }
      });

      it('should reject missing password field', () => {
        // Arrange
        const invalidData = {
          email: 'test@example.com',
        };

        // Act
        const result = loginSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Missing password field should fail').toBe(false);
        if (!result.success) {
          const passwordError = result.error.issues.find(i => i.path.includes('password'));
          expect(passwordError).toBeDefined();
        }
      });
    });

    describe('type safety', () => {
      it('should properly infer LoginFormData type', () => {
        // Arrange
        const validData = {
          email: 'test@example.com',
          password: 'password123',
        };

        // Act
        const result = loginSchema.safeParse(validData);

        // Assert
        if (result.success) {
          expectTypeOf(result.data).toEqualTypeOf<LoginFormData>();
          expectTypeOf(result.data.email).toBeString();
          expectTypeOf(result.data.password).toBeString();
        }
      });
    });
  });

  describe('registerSchema', () => {
    describe('valid scenarios', () => {
      it('should validate correct registration data', () => {
        // Arrange
        const validData = {
          email: 'newuser@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        };

        // Act
        const result = registerSchema.safeParse(validData);

        // Assert
        expect(result.success, 'Valid registration data should pass').toBe(true);
        if (result.success) {
          expectTypeOf(result.data).toMatchTypeOf<RegisterFormData>();
        }
      });

      it('should accept password with all required components', () => {
        // Arrange
        const validPasswords = [
          'Abcdefg1', // minimum: uppercase, lowercase, digit
          'Password123',
          'MySecure1Pass',
          'Test1234Password',
        ];

        // Act & Assert
        validPasswords.forEach(password => {
          const result = registerSchema.safeParse({
            email: 'test@example.com',
            password,
            confirmPassword: password,
          });
          expect(result.success, `Password "${password}" should be valid`).toBe(true);
        });
      });

      it('should accept minimum 8 character password', () => {
        // Arrange
        const validData = {
          email: 'test@example.com',
          password: 'Passw0rd',
          confirmPassword: 'Passw0rd',
        };

        // Act
        const result = registerSchema.safeParse(validData);

        // Assert
        expect(result.success, '8 character password should pass').toBe(true);
      });
    });

    describe('email validation', () => {
      it('should reject invalid email', () => {
        // Arrange
        const invalidData = {
          email: 'invalid-email',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        };

        // Act
        const result = registerSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Invalid email should fail').toBe(false);
        if (!result.success) {
          const emailError = result.error.issues.find(i => i.path.includes('email'));
          expect(emailError?.message).toBe('Nieprawidłowy format email');
        }
      });

      it('should reject empty email', () => {
        // Arrange
        const invalidData = {
          email: '',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
        };

        // Act
        const result = registerSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Empty email should fail').toBe(false);
      });
    });

    describe('password complexity validation', () => {
      it('should reject password shorter than 8 characters', () => {
        // Arrange
        const shortPasswords = ['Pass1', 'Abc123', 'Test1'];

        // Act & Assert
        shortPasswords.forEach(password => {
          const result = registerSchema.safeParse({
            email: 'test@example.com',
            password,
            confirmPassword: password,
          });
          expect(result.success, `Password "${password}" (${password.length} chars) should fail`).toBe(false);
          if (!result.success) {
            const passwordError = result.error.issues.find(i => 
              i.path.includes('password') && i.message.includes('co najmniej 8')
            );
            expect(passwordError).toBeDefined();
          }
        });
      });

      it('should reject password without lowercase letter', () => {
        // Arrange
        const invalidPasswords = [
          'PASSWORD123',
          'SECURE1PASS',
          'TEST12345',
        ];

        // Act & Assert
        invalidPasswords.forEach(password => {
          const result = registerSchema.safeParse({
            email: 'test@example.com',
            password,
            confirmPassword: password,
          });
          expect(result.success, `Password without lowercase "${password}" should fail`).toBe(false);
          if (!result.success) {
            const passwordError = result.error.issues.find(i => 
              i.path.includes('password') && i.message.includes('małą literę')
            );
            expect(passwordError?.message).toBe('Hasło musi zawierać małą literę, dużą literę i cyfrę');
          }
        });
      });

      it('should reject password without uppercase letter', () => {
        // Arrange
        const invalidPasswords = [
          'password123',
          'secure1pass',
          'test12345',
        ];

        // Act & Assert
        invalidPasswords.forEach(password => {
          const result = registerSchema.safeParse({
            email: 'test@example.com',
            password,
            confirmPassword: password,
          });
          expect(result.success, `Password without uppercase "${password}" should fail`).toBe(false);
          if (!result.success) {
            const passwordError = result.error.issues.find(i => 
              i.path.includes('password') && i.message.includes('dużą literę')
            );
            expect(passwordError?.message).toBe('Hasło musi zawierać małą literę, dużą literę i cyfrę');
          }
        });
      });

      it('should reject password without digit', () => {
        // Arrange
        const invalidPasswords = [
          'PasswordOnly',
          'SecurePass',
          'TestPassword',
        ];

        // Act & Assert
        invalidPasswords.forEach(password => {
          const result = registerSchema.safeParse({
            email: 'test@example.com',
            password,
            confirmPassword: password,
          });
          expect(result.success, `Password without digit "${password}" should fail`).toBe(false);
          if (!result.success) {
            const passwordError = result.error.issues.find(i => 
              i.path.includes('password') && i.message.includes('cyfrę')
            );
            expect(passwordError?.message).toBe('Hasło musi zawierać małą literę, dużą literę i cyfrę');
          }
        });
      });

      it('should reject password missing multiple requirements', () => {
        // Arrange
        const invalidPasswords = [
          'password', // no uppercase, no digit
          'PASSWORD', // no lowercase, no digit
          '12345678', // no uppercase, no lowercase
        ];

        // Act & Assert
        invalidPasswords.forEach(password => {
          const result = registerSchema.safeParse({
            email: 'test@example.com',
            password,
            confirmPassword: password,
          });
          expect(result.success, `Password "${password}" missing requirements should fail`).toBe(false);
        });
      });
    });

    describe('password confirmation validation', () => {
      it('should reject mismatched passwords', () => {
        // Arrange
        const invalidData = {
          email: 'test@example.com',
          password: 'SecurePass123',
          confirmPassword: 'DifferentPass456',
        };

        // Act
        const result = registerSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Mismatched passwords should fail').toBe(false);
        if (!result.success) {
          const confirmError = result.error.issues.find(i => 
            i.path.includes('confirmPassword')
          );
          expect(confirmError?.message).toBe('Hasła muszą być identyczne');
        }
      });

      it('should reject when confirmPassword differs by case', () => {
        // Arrange
        const invalidData = {
          email: 'test@example.com',
          password: 'SecurePass123',
          confirmPassword: 'securepass123',
        };

        // Act
        const result = registerSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Case-different passwords should fail').toBe(false);
      });

      it('should reject when confirmPassword differs by whitespace', () => {
        // Arrange
        const invalidData = {
          email: 'test@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123 ',
        };

        // Act
        const result = registerSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Whitespace difference should fail').toBe(false);
      });

      it('should reject empty confirmPassword', () => {
        // Arrange
        const invalidData = {
          email: 'test@example.com',
          password: 'SecurePass123',
          confirmPassword: '',
        };

        // Act
        const result = registerSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Empty confirmPassword should fail').toBe(false);
        if (!result.success) {
          const confirmError = result.error.issues.find(i => 
            i.message.includes('Potwierdzenie hasła jest wymagane')
          );
          expect(confirmError).toBeDefined();
        }
      });
    });

    describe('missing fields', () => {
      it('should reject missing all fields', () => {
        // Arrange
        const invalidData = {};

        // Act
        const result = registerSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Empty object should fail').toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
        }
      });

      it('should reject missing confirmPassword', () => {
        // Arrange
        const invalidData = {
          email: 'test@example.com',
          password: 'SecurePass123',
        };

        // Act
        const result = registerSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Missing confirmPassword should fail').toBe(false);
      });
    });
  });

  describe('forgotPasswordSchema', () => {
    describe('valid scenarios', () => {
      it('should validate correct email', () => {
        // Arrange
        const validData = {
          email: 'user@example.com',
        };

        // Act
        const result = forgotPasswordSchema.safeParse(validData);

        // Assert
        expect(result.success, 'Valid email should pass').toBe(true);
        if (result.success) {
          expectTypeOf(result.data).toMatchTypeOf<ForgotPasswordFormData>();
        }
      });

      it('should accept various valid email formats', () => {
        // Arrange
        const validEmails = [
          'user@test.com',
          'admin+tag@example.co.uk',
          'first.last@subdomain.example.com',
        ];

        // Act & Assert
        validEmails.forEach(email => {
          const result = forgotPasswordSchema.safeParse({ email });
          expect(result.success, `Email ${email} should be valid`).toBe(true);
        });
      });
    });

    describe('email validation', () => {
      it('should reject empty email', () => {
        // Arrange
        const invalidData = { email: '' };

        // Act
        const result = forgotPasswordSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Empty email should fail').toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toBe('Email jest wymagany');
        }
      });

      it('should reject invalid email formats', () => {
        // Arrange
        const invalidEmails = [
          'not-an-email',
          '@example.com',
          'user@',
          'user domain@example.com',
        ];

        // Act & Assert
        invalidEmails.forEach(email => {
          const result = forgotPasswordSchema.safeParse({ email });
          expect(result.success, `Invalid email "${email}" should fail`).toBe(false);
          if (!result.success) {
            expect(result.error.issues[0].message).toBe('Nieprawidłowy format email');
          }
        });
      });

      it('should reject missing email field', () => {
        // Arrange
        const invalidData = {};

        // Act
        const result = forgotPasswordSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Missing email field should fail').toBe(false);
      });
    });
  });

  describe('resetPasswordSchema', () => {
    describe('valid scenarios', () => {
      it('should validate correct password reset data', () => {
        // Arrange
        const validData = {
          password: 'NewSecure123',
          confirmPassword: 'NewSecure123',
        };

        // Act
        const result = resetPasswordSchema.safeParse(validData);

        // Assert
        expect(result.success, 'Valid reset password data should pass').toBe(true);
        if (result.success) {
          expectTypeOf(result.data).toMatchTypeOf<ResetPasswordFormData>();
        }
      });

      it('should accept minimum valid password', () => {
        // Arrange
        const validData = {
          password: 'Passw0rd',
          confirmPassword: 'Passw0rd',
        };

        // Act
        const result = resetPasswordSchema.safeParse(validData);

        // Assert
        expect(result.success, 'Minimum 8 char password should pass').toBe(true);
      });
    });

    describe('password complexity validation', () => {
      it('should reject password shorter than 8 characters', () => {
        // Arrange
        const invalidData = {
          password: 'Pass1',
          confirmPassword: 'Pass1',
        };

        // Act
        const result = resetPasswordSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Short password should fail').toBe(false);
        if (!result.success) {
          const passwordError = result.error.issues.find(i => 
            i.message.includes('co najmniej 8')
          );
          expect(passwordError).toBeDefined();
        }
      });

      it('should reject password without required complexity', () => {
        // Arrange
        const invalidPasswords = [
          { pass: 'password123', reason: 'no uppercase' },
          { pass: 'PASSWORD123', reason: 'no lowercase' },
          { pass: 'PasswordOnly', reason: 'no digit' },
        ];

        // Act & Assert
        invalidPasswords.forEach(({ pass, reason }) => {
          const result = resetPasswordSchema.safeParse({
            password: pass,
            confirmPassword: pass,
          });
          expect(result.success, `Password ${reason} should fail`).toBe(false);
        });
      });

      it('should reject empty password', () => {
        // Arrange
        const invalidData = {
          password: '',
          confirmPassword: '',
        };

        // Act
        const result = resetPasswordSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Empty password should fail').toBe(false);
      });
    });

    describe('password confirmation validation', () => {
      it('should reject mismatched passwords', () => {
        // Arrange
        const invalidData = {
          password: 'NewSecure123',
          confirmPassword: 'DifferentPass456',
        };

        // Act
        const result = resetPasswordSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Mismatched passwords should fail').toBe(false);
        if (!result.success) {
          const confirmError = result.error.issues.find(i => 
            i.path.includes('confirmPassword')
          );
          expect(confirmError?.message).toBe('Hasła muszą być identyczne');
        }
      });

      it('should reject empty confirmPassword', () => {
        // Arrange
        const invalidData = {
          password: 'NewSecure123',
          confirmPassword: '',
        };

        // Act
        const result = resetPasswordSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Empty confirmPassword should fail').toBe(false);
      });

      it('should be case-sensitive in password matching', () => {
        // Arrange
        const invalidData = {
          password: 'SecurePass123',
          confirmPassword: 'SECUREPASS123',
        };

        // Act
        const result = resetPasswordSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Case difference should fail matching').toBe(false);
      });
    });

    describe('missing fields', () => {
      it('should reject missing all fields', () => {
        // Arrange
        const invalidData = {};

        // Act
        const result = resetPasswordSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Empty object should fail').toBe(false);
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
        }
      });

      it('should reject missing confirmPassword', () => {
        // Arrange
        const invalidData = {
          password: 'NewSecure123',
        };

        // Act
        const result = resetPasswordSchema.safeParse(invalidData);

        // Assert
        expect(result.success, 'Missing confirmPassword should fail').toBe(false);
      });
    });
  });

  describe('cross-schema validation', () => {
    it('loginSchema should accept passwords rejected by registerSchema', () => {
      // Arrange - password valid for login but not for registration
      const simplePassword = 'simple';

      // Act
      const loginResult = loginSchema.safeParse({
        email: 'test@example.com',
        password: simplePassword,
      });
      const registerResult = registerSchema.safeParse({
        email: 'test@example.com',
        password: simplePassword,
        confirmPassword: simplePassword,
      });

      // Assert
      expect(loginResult.success, 'Simple password should pass login').toBe(true);
      expect(registerResult.success, 'Simple password should fail registration').toBe(false);
    });

    it('registerSchema and resetPasswordSchema should have same password requirements', () => {
      // Arrange
      const testPasswords = [
        { pass: 'Passw0rd', shouldPass: true },
        { pass: 'password', shouldPass: false },
        { pass: 'Pass1', shouldPass: false },
      ];

      // Act & Assert
      testPasswords.forEach(({ pass, shouldPass }) => {
        const registerResult = registerSchema.safeParse({
          email: 'test@example.com',
          password: pass,
          confirmPassword: pass,
        });
        const resetResult = resetPasswordSchema.safeParse({
          password: pass,
          confirmPassword: pass,
        });

        expect(
          registerResult.success,
          `Register: password "${pass}" should ${shouldPass ? 'pass' : 'fail'}`
        ).toBe(shouldPass);
        expect(
          resetResult.success,
          `Reset: password "${pass}" should ${shouldPass ? 'pass' : 'fail'}`
        ).toBe(shouldPass);
      });
    });
  });
});

