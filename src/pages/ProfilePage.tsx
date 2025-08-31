import { useQuery } from '@tanstack/react-query';
import { getProfilePuzzles, getProfileExperience, getProfileGames } from '@/api/profile.ts';
import { getLeaderboard } from '@/api/leaderboard.ts';

export const ProfilePage = () => {
  const { data: profilePuzzlesData } = useQuery({
    queryKey: ['ProfilePuzzles'],
    queryFn: getProfilePuzzles,
  });

  const { data: profileExperienceData } = useQuery({
    queryKey: ['ProfileExperience'],
    queryFn: getProfileExperience,
  });

  const { data: profileGamesData } = useQuery({
    queryKey: ['ProfileGames'],
    queryFn: getProfileGames,
  });

  const { data: leaderboardData } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
  });
  console.log(leaderboardData);
  console.log(profilePuzzlesData);
  console.log(profileExperienceData);
  console.log(profileGamesData);

  return <div>Profile</div>;
};
