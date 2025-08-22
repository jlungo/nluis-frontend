import { Outlet, useNavigation } from 'react-router';

export default function RegistrationLayout() {
  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  return (
    <>
      {isNavigating && <div className="m-auto w-fit h-fit">Loading...</div>}
      <Outlet />
    </>
  );
}
