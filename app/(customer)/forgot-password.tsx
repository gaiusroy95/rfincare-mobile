import ForgotPasswordScreen from '@/src/screens/ForgotPasswordScreen';

export default function CustomerForgotPasswordRoute() {
  return (
    <ForgotPasswordScreen
      variant="customer"
      loginRoute="/(customer)/login"
    />
  );
}
