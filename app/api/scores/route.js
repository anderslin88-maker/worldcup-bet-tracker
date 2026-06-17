export async function GET() {
  const apiKey = process.env.FOOTBALL_API_KEY;
  const leagueId = process.env.FOOTBALL_API_LEAGUE_ID || "1";
  const season = process.env.FOOTBALL_API_SEASON || "2026";

  if (!apiKey) {
    return Response.json(
      { error: "Missing FOOTBALL_API_KEY in Vercel Environment Variables." },
      { status: 500 }
    );
  }

  const matchMap = [
    { display: "🇲🇽 墨西哥 vs 🇿🇦 南非", home: "Mexico", away: "South Africa" },
    { display: "🇰🇷 南韓 vs 🇨🇿 捷克", home: "South Korea", away: "Czechia" },
    { display: "🇨🇦 加拿大 vs 🇧🇦 波士尼亞", home: "Canada", away: "Bosnia and Herzegovina" },
    { display: "🇺🇸 美國 vs 🇵🇾 巴拉圭", home: "United States", away: "Paraguay" },
    { display: "🇶🇦 卡達 vs 🇨🇭 瑞士", home: "Qatar", away: "Switzerland" },
    { display: "🇧🇷 巴西 vs 🇲🇦 摩洛哥", home: "Brazil", away: "Morocco" },
    { display: "🇭🇹 海地 vs 🏴 蘇格蘭", home: "Haiti", away: "Scotland" },
    { display: "🇦🇺 澳洲 vs 🇹🇷 土耳其", home: "Australia", away: "Turkey" },
    { display: "🇩🇪 德國 vs 🇨🇼 庫拉索", home: "Germany", away: "Curacao" },
    { display: "🇳🇱 荷蘭 vs 🇯🇵 日本", home: "Netherlands", away: "Japan" },
    { display: "🇨🇮 象牙海岸 vs 🇪🇨 厄瓜多", home: "Ivory Coast", away: "Ecuador" },
    { display: "🇸🇪 瑞典 vs 🇹🇳 突尼西亞", home: "Sweden", away: "Tunisia" },
    { display: "🇪🇸 西班牙 vs 🇨🇻 維德角", home: "Spain", away: "Cape Verde" },
    { display: "🇧🇪 比利時 vs 🇪🇬 埃及", home: "Belgium", away: "Egypt" },
    { display: "🇸🇦 沙烏地阿拉伯 vs 🇺🇾 烏拉圭", home: "Saudi Arabia", away: "Uruguay" },
    { display: "🇮🇷 伊朗 vs 🇳🇿 紐西蘭", home: "Iran", away: "New Zealand" },
    { display: "🇫🇷 法國 vs 🇸🇳 塞內加爾", home: "France", away: "Senegal" },
    { display: "🇮🇶 伊拉克 vs 🇳🇴 挪威", home: "Iraq", away: "Norway" },
    { display: "🇦🇷 阿根廷 vs 🇩🇿 阿爾及利亞", home: "Argentina", away: "Algeria" },
    { display: "🇦🇹 奧地利 vs 🇯🇴 約旦", home: "Austria", away: "Jordan" },
    { display: "🇵🇹 葡萄牙 vs 🇨🇩 剛果民主共和國", home: "Portugal", away: "DR Congo" },
    { display: "🏴 英格蘭 vs 🇭🇷 克羅埃西亞", home: "England", away: "Croatia" },
    { display: "🇬🇭 迦納 vs 🇵🇦 巴拿馬", home: "Ghana", away: "Panama" },
    { display: "🇺🇿 烏茲別克 vs 🇨🇴 哥倫比亞", home: "Uzbekistan", away: "Colombia" },

    { display: "🇨🇿 捷克 vs 🇿🇦 南非", home: "Czechia", away: "South Africa" },
    { display: "🇨🇭 瑞士 vs 🇧🇦 波士尼亞", home: "Switzerland", away: "Bosnia and Herzegovina" },
    { display: "🇨🇦 加拿大 vs 🇶🇦 卡達", home: "Canada", away: "Qatar" },
    { display: "🇲🇽 墨西哥 vs 🇰🇷 南韓", home: "Mexico", away: "South Korea" },
    { display: "🇺🇸 美國 vs 🇦🇺 澳洲", home: "United States", away: "Australia" },
    { display: "🏴 蘇格蘭 vs 🇲🇦 摩洛哥", home: "Scotland", away: "Morocco" },
    { display: "🇧🇷 巴西 vs 🇭🇹 海地", home: "Brazil", away: "Haiti" },
    { display: "🇹🇷 土耳其 vs 🇵🇾 巴拉圭", home: "Turkey", away: "Paraguay" },
    { display: "🇳🇱 荷蘭 vs 🇸🇪 瑞典", home: "Netherlands", away: "Sweden" },
    { display: "🇩🇪 德國 vs 🇨🇮 象牙海岸", home: "Germany", away: "Ivory Coast" },
    { display: "🇪🇨 厄瓜多 vs 🇨🇼 庫拉索", home: "Ecuador", away: "Curacao" },
    { display: "🇹🇳 突尼西亞 vs 🇯🇵 日本", home: "Tunisia", away: "Japan" },
    { display: "🇪🇸 西班牙 vs 🇸🇦 沙烏地阿拉伯", home: "Spain", away: "Saudi Arabia" },
    { display: "🇧🇪 比利時 vs 🇮🇷 伊朗", home: "Belgium", away: "Iran" },
    { display: "🇺🇾 烏拉圭 vs 🇨🇻 維德角", home: "Uruguay", away: "Cape Verde" },
    { display: "🇳🇿 紐西蘭 vs 🇪🇬 埃及", home: "New Zealand", away: "Egypt" },
    { display: "🇦🇷 阿根廷 vs 🇦🇹 奧地利", home: "Argentina", away: "Austria" },
    { display: "🇫🇷 法國 vs 🇮🇶 伊拉克", home: "France", away: "Iraq" },
    { display: "🇳🇴 挪威 vs 🇸🇳 塞內加爾", home: "Norway", away: "Senegal" },
    { display: "🇯🇴 約旦 vs 🇩🇿 阿爾及利亞", home: "Jordan", away: "Algeria" },
    { display: "🇵🇹 葡萄牙 vs 🇺🇿 烏茲別克", home: "Portugal", away: "Uzbekistan" },
    { display: "🏴 英格蘭 vs 🇬🇭 迦納", home: "England", away: "Ghana" },
    { display: "🇵🇦 巴拿馬 vs 🇭🇷 克羅埃西亞", home: "Panama", away: "Croatia" },
    { display: "🇨🇴 哥倫比亞 vs 🇨🇩 剛果民主共和國", home: "Colombia", away: "DR Congo" },

    { display: "🇨🇭 瑞士 vs 🇨🇦 加拿大", home: "Switzerland", away: "Canada" },
    { display: "🇧🇦 波士尼亞 vs 🇶🇦 卡達", home: "Bosnia and Herzegovina", away: "Qatar" },
    { display: "🏴 蘇格蘭 vs 🇧🇷 巴西", home: "Scotland", away: "Brazil" },
    { display: "🇲🇦 摩洛哥 vs 🇭🇹 海地", home: "Morocco", away: "Haiti" },
    { display: "🇨🇿 捷克 vs 🇲🇽 墨西哥", home: "Czechia", away: "Mexico" },
    { display: "🇿🇦 南非 vs 🇰🇷 南韓", home: "South Africa", away: "South Korea" },
    { display: "🇪🇨 厄瓜多 vs 🇩🇪 德國", home: "Ecuador", away: "Germany" },
    { display: "🇨🇼 庫拉索 vs 🇨🇮 象牙海岸", home: "Curacao", away: "Ivory Coast" },
    { display: "🇹🇳 突尼西亞 vs 🇳🇱 荷蘭", home: "Tunisia", away: "Netherlands" },
    { display: "🇯🇵 日本 vs 🇸🇪 瑞典", home: "Japan", away: "Sweden" },
    { display: "🇹🇷 土耳其 vs 🇺🇸 美國", home: "Turkey", away: "United States" },
    { display: "🇵🇾 巴拉圭 vs 🇦🇺 澳洲", home: "Paraguay", away: "Australia" },
    { display: "🇳🇴 挪威 vs 🇫🇷 法國", home: "Norway", away: "France" },
    { display: "🇸🇳 塞內加爾 vs 🇮🇶 伊拉克", home: "Senegal", away: "Iraq" },
    { display: "🇺🇾 烏拉圭 vs 🇪🇸 西班牙", home: "Uruguay", away: "Spain" },
    { display: "🇨🇻 維德角 vs 🇸🇦 沙烏地阿拉伯", home: "Cape Verde", away: "Saudi Arabia" },
    { display: "🇳🇿 紐西蘭 vs 🇧🇪 比利時", home: "New Zealand", away: "Belgium" },
    { display: "🇪🇬 埃及 vs 🇮🇷 伊朗", home: "Egypt", away: "Iran" },
    { display: "🇵🇦 巴拿馬 vs 🏴 英格蘭", home: "Panama", away: "England" },
    { display: "🇭🇷 克羅埃西亞 vs 🇬🇭 迦納", home: "Croatia", away: "Ghana" },
    { display: "🇨🇴 哥倫比亞 vs 🇵🇹 葡萄牙", home: "Colombia", away: "Portugal" },
    { display: "🇨🇩 剛果民主共和國 vs 🇺🇿 烏茲別克", home: "DR Congo", away: "Uzbekistan" },
    { display: "🇯🇴 約旦 vs 🇦🇷 阿根廷", home: "Jordan", away: "Argentina" },
    { display: "🇩🇿 阿爾及利亞 vs 🇦🇹 奧地利", home: "Algeria", away: "Austria" },
  ];

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
  }

  const aliases = {
    unitedstates: ["usa", "unitedstates"],
    drcongo: ["drcongo", "congo", "congodr", "democraticrepublicofcongo"],
    bosniaandherzegovina: ["bosniaandherzegovina", "bosnia"],
    ivorycoast: ["ivorycoast", "cotedivoire"],
    southkorea: ["southkorea", "korea republic", "korearepublic", "korea"],
    curacao: ["curacao", "curaçao"],
    czechia: ["czechia", "czechrepublic"],
    capeverde: ["capeverde"],
  };

  function teamMatches(apiName, expectedName) {
    const api = normalize(apiName);
    const expected = normalize(expectedName);
    const options = [expected, ...(aliases[expected] || [])].map(normalize);
    return options.some((item) => api === item || api.includes(item) || item.includes(api));
  }

  try {
    const url = `https://v3.football.api-sports.io/fixtures?league=${leagueId}&season=${season}`;
    const res = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return Response.json(
        { error: `Football API error: ${res.status}` },
        { status: 500 }
      );
    }

    const data = await res.json();
    const fixtures = data.response || [];
    const scores = {};

    for (const map of matchMap) {
      const fixture = fixtures.find((f) => {
        const homeName = f?.teams?.home?.name;
        const awayName = f?.teams?.away?.name;

        const sameDirection =
          teamMatches(homeName, map.home) && teamMatches(awayName, map.away);

        const reverseDirection =
          teamMatches(homeName, map.away) && teamMatches(awayName, map.home);

        return sameDirection || reverseDirection;
      });

      if (!fixture) continue;

      const status = fixture?.fixture?.status?.short;
      const finishedStatuses = ["FT", "AET", "PEN"];
      const isFinished = finishedStatuses.includes(status);

      const homeGoals = fixture?.goals?.home;
      const awayGoals = fixture?.goals?.away;

      if (isFinished && homeGoals !== null && awayGoals !== null) {
        const apiHomeName = fixture?.teams?.home?.name;
        const sameDirection =
          teamMatches(apiHomeName, map.home);

        scores[map.display] = sameDirection
          ? `${homeGoals}-${awayGoals}`
          : `${awayGoals}-${homeGoals}`;
      }
    }

    return Response.json({ scores });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
