import CreatorNavBar from './CreatorNavBar';

export default function UserNav() {
  return (
    <CreatorNavBar basePath="/u" loginPath="/login" playLabel="Vào chơi ↗" showMyGames creatorLinks={false} />
  );
}
