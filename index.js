require("dotenv").config();

const { App } = require("@slack/bolt");
const ranks = require("./ranks.json");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true
});

function getPrimaryRank(points) {
	const entries = Object.entries(ranks)
		.filter(([, rankData]) => typeof rankData.minPoints === 'number')
		.sort((a, b) => b[1].minPoints - a[1].minPoints);

	for (const [rankName, rankData] of entries) {
		if (points >= rankData.minPoints) {
			return rankName;
		}
	}

	return "Intern";
}

async function getUsername(userId) {
    try {
        const res = await fetch(
            `https://api.polytoria.com/v1/users/${encodeURIComponent(String(userId))}`,
            { method: 'GET' }
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const username = data.username ?? `User ${String(userId)}`;

        return username;
    } catch {
        return `User ${String(userId)}`;
    }
}

app.command("/intatom-ping", async ({ command, ack, respond }) => {
  const start = Date.now();
  await ack();
  const latency = Date.now() - start;
  await respond({ text: `Pong!\nLatency: ${latency}ms` });
  return;
});

app.command("/intatom-help", async ({ command, ack, respond }) => {
    await ack();
    const args = command.text.toLowerCase().toLowerCase().trim().match(/\S+/g)||[];
    if (!args[0] || !((args[0] == "false") || (args[0] == "f") || (args[0] == "n") || (args[0] == "no"))) {
        await respond({ text: `/intatom-credits [operation ( g )] [usertype ( un, uid )] [user ( - any - )]\n/intatom-help [minimal (y/n)]\n/intatom-ping`});
        return;
    }
    else {
        await respond({ text: `/intatom-credits [operation] [usertype] [user]: Perform credit operations\n[operation]: Selects an operation to perform out of [ Get, g ]\n[type]: Selects between Username or userId [ Username , un, userId, uid ]\n[user]: Either any Username or userId\n\n/intatom-help [minimal]: Prints this message\n[minimal]: (default: true) or [ false, f, no, n ]\n\n/intatom-ping: Tests bot latency`});
        return;
    }
});

app.command("/intatom-totalpowergenerated", async ({ command, ack, respond }) => {
    await ack();
    const url = process.env.SUPABASE_URL + `game?type=eq.TotalPowerMWh&select=value`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'apikey': process.env.SUPABASE_API_KEY,
                'Authorization': process.env.SUPABASE_AUTH,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        if (data.length > 0 && data[0].value != null) {
            let totalMWh = data[0].value;
            let formattedMWh = totalMWh.toLocaleString()
            const homes = Math.round(totalMWh);
            const bulbs = Math.round(totalMWh * 100);
            const steelMills = (totalMWh / 1200).toFixed(2);
            await respond( { text: `There has been a total ${formattedMWh} MWh of electricity generated at Vogataya Generating Station!\nThat's about:\n• ${homes.toLocaleString()} American homes powered for 1 month\n• ${bulbs.toLocaleString()} LED bulbs running for 1000 hours\n• ${steelMills} steel mills running for 24 hours` });
            return;
        } else {
            await respond( { text: `Something is seriously wrong with the response from GET` });
            return;
        }
    } catch (error){
        console.error(error);
        await respond( { text: `Something is seriously wrong with GET` });
        return;
    }
});

app.command("/intatom-credits", async ({ command, ack, respond }) => {
    await ack();
    const args = command.text.toLowerCase().trim().match(/\S+/g)||[];
    if (args.length < 3) {
        await respond({ text: `Not enough parameters: 3 expected, got ${args.length}` });
        return;
    }
    if (args.length > 3) {
        await respond({ text: `Too many parameters: 3 expected, got ${args.length}` });
        return;
    }

    const operation = args[0]
    const usertype = args[1]
    const user = args[2]
    let userId;
    let displayUser = user;

    if (usertype == "n" || usertype == "un" || usertype == "unm" || usertype == "username") {
        try {
            const response = await fetch(
                `https://api.polytoria.com/v1/users/find?username=${user}`,
					{
						method: 'GET'
					}
            );

            if (!response.ok) {
                throw new Error("polytoria's down bozo");
            }

            const data = await response.json();
            userId = data.id;
            displayUser = user;
        }
        catch (error) {
            console.error(error);
            await respond({ text: "Something went wrong with the Polytoria API" });
            return;
        }
    }
    else if (usertype == "uid" || usertype == "id" || usertype == "userId") {
        userId = user;
        displayUser = await getUsername(user)
    }

    if (operation == "g" || operation == "get") {
        const url = process.env.SUPABASE_URL + `players?userid=eq.${userId}&select=points,assigned_role`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': process.env.SUPABASE_API_KEY,
                    'Authorization': process.env.SUPABASE_AUTH,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (data.length > 0 && data[0].points != null) {
                const points = Number(data[0].points);
                const assignedRole = data[0].assigned_role;
                const pointRank = getPrimaryRank(points);
                const assignedRoleText = assignedRole ? ` (${assignedRole})` : '';

                await respond({ text: `User ${displayUser} has ${points} Credits\nUser ${displayUser} is ranked ${pointRank}${assignedRoleText}` });
                return;
            } else {
                await respond({ text: `User ${userId} either has 0 credits or doesn't exist` });
                return;
            }
        }
        catch (error) {
            console.error(error);
            await respond({ text: "Failed to GET Credits from the database" });
            return;
        }
    }
    
    return;
});

(async () => {
  await app.start();
  console.log("bot is running!");
})();