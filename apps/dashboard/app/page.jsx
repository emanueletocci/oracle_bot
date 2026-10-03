"use client";

import {
	ArrowUpRight,
	ChevronRight,
	Circle,
	Code2,
	Command,
	Headphones,
	Menu,
	Radio,
	ShieldCheck,
	Sparkles,
	Terminal,
	Wrench,
	X,
} from "lucide-react";
import { useState } from "react";

const features = [
	{
		icon: Radio,
		title: "Radio LoFi 24/7",
		text: "A steady stream of late-night beats for every grind, game, and quiet moment.",
		status: "Online",
		tone: "green",
	},
	{
		icon: Sparkles,
		title: "Fun & Roleplay",
		text: "Tarot readings, shipping, and playful commands that make your server feel alive.",
		status: "In progress",
		tone: "yellow",
	},
	{
		icon: Wrench,
		title: "Utility",
		text: "Server info, diagnostics, and the everyday tools your community actually needs.",
		status: "Online",
		tone: "green",
	},
	{
		icon: ShieldCheck,
		title: "Security Suite",
		text: "A sharp moderation toolkit built to keep your space safe without the busywork.",
		status: "Planned",
		tone: "red",
	},
];

const commands = {
	Fun: [
		["/tarot", "Draw a card and reveal your fate"],
		["/ship", "Calculate the chemistry between two users"],
		["/8ball", "Ask the oracle a burning question"],
	],
	Media: [
		["/play", "Start a track or a playlist"],
		["/radio", "Tune into the 24/7 LoFi station"],
		["/skip", "Move the queue forward"],
	],
	Utility: [
		["/serverinfo", "Inspect your server at a glance"],
		["/diagnose", "Check Oracle health and latency"],
		["/help", "Browse every available command"],
	],
};

function Logo() {
	return (
		<a href="#top" className="logo" aria-label="Oracle home">
			<span className="logo-mark">O</span>
			<span>RACLE</span>
			<i />
		</a>
	);
}

export function Navbar() {
	const [open, setOpen] = useState(false);
	return (
		<header className="nav-wrap fixed top-0 w-full z-50 bg-oracle-ink">
			<nav className="nav" aria-label="Main navigation">
				<Logo />
				<button
					className="menu-toggle"
					onClick={() => setOpen(!open)}
					aria-label={open ? "Close menu" : "Open menu"}
				>
					{open ? <X /> : <Menu />}
				</button>
				<div className={`nav-links ${open ? "is-open" : ""}`}>
					<a href="#features" onClick={() => setOpen(false)}>
						Features
					</a>
					<a href="#commands" onClick={() => setOpen(false)}>
						Commands
					</a>
					<a href="#roadmap" onClick={() => setOpen(false)}>
						Roadmap
					</a>
					<a
						href="https://github.com/emanueletocci/oracle_bot"
						target="_blank"
						rel="noreferrer"
						onClick={() => setOpen(false)}
					>
						GitHub
					</a>
					<a
						className="nav-cta"
						href="https://discord.com"
						target="_blank"
						rel="noreferrer"
						onClick={() => setOpen(false)}
					>
						Invite <ArrowUpRight />
					</a>
				</div>
			</nav>
		</header>
	);
}

export function Hero() {
	return (
		<section className="hero section-pad" id="top">
			<div className="hero-copy">
				<div className="eyebrow">
					<span className="eyebrow-dot" /> OPEN SOURCE · DISCORD.JS
				</div>
				<h1>
					ONE BOT.
					<br />
					<em>ENDLESS</em> CHAOS.
				</h1>
				<p>
					Oracle is the free, open-source all-in-one Discord bot for servers
					that refuse to settle for ordinary.
				</p>
				<div className="hero-actions">
					<a
						className="button button-red"
						href="https://discord.com"
						target="_blank"
						rel="noreferrer"
					>
						Add to Discord <ArrowUpRight />
					</a>
					<a
						className="button button-ghost"
						href="https://github.com/emanueletocci/oracle_bot"
						target="_blank"
						rel="noreferrer"
					>
						<Code2 /> View on GitHub
					</a>
				</div>
				<div className="hero-meta">
					<span>
						<Circle fill="currentColor" /> FREE FOREVER
					</span>
					<span>
						<Circle fill="currentColor" /> NO PAYWALLS
					</span>
				</div>
			</div>
			<DiscordMockup />
		</section>
	);
}

function DiscordMockup() {
	return (
		<div
			className="discord-stage"
			aria-label="Preview of Oracle responding in Discord"
		>
			<div className="burst burst-one">✦</div>
			<div className="burst burst-two">✦</div>
			<div className="discord-card">
				<div className="discord-top">
					<span className="discord-channel"># 🗼渋谷区┃shibuya</span>
					<span className="discord-users">● 128 ONLINE</span>
				</div>
				<div className="chat-space">
					<div className="chat-message">
						<div className="avatar avatar-user">E</div>
						<div>
							<div className="chat-name">
								Emanuele <small>today at 11:42 PM</small>
							</div>
							<p>Oracle, set the mood!</p>
						</div>
					</div>
					<div className="chat-message bot-message">
						<div className="avatar avatar-bot">O</div>
						<div className="bot-body">
							<div className="chat-name">
								Oracle <span className="bot-tag">BOT</span>{" "}
								<small>today at 11:42 PM</small>
							</div>
							<p>
								Say less. <span className="red-text">LoFi radio is live.</span>
							</p>
							<div className="player">
								<div className="album-art">
									<Radio />
								</div>
								<div>
									<strong>Midnight in Tokyo</strong>
									<span>Oracle Radio · 24/7</span>
								</div>
								<div className="equalizer">
									<i />
									<i />
									<i />
									<i />
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="chat-input">
					<span>Message #🗼渋谷区┃shibuya</span>
					<Command />
				</div>
				<div className="card-sticker">
					FREE
					<br />
					<span>FOREVER</span>
				</div>
			</div>
		</div>
	);
}

export function Mission() {
	return (
		<section className="mission section-pad">
			<div className="section-label">01 / THE MISSION</div>
			<div className="mission-grid">
				<div className="mission-block problem">
					<span className="block-number">01</span>
					<h2>
						WHY ARE THERE
						<br />
						<span>SO MANY BOTS?</span>
					</h2>
					<p>
						One for music. One for moderation. One for fun. Suddenly your server
						has a dozen dashboards and half of them want your money.
					</p>
				</div>
				<div className="mission-arrow">→</div>
				<div className="mission-block solution">
					<span className="block-number">02</span>
					<h2>
						MEET YOUR
						<br />
						<span>NEW MAIN.</span>
					</h2>
					<p>
						Oracle brings the essentials into one sharp, open-source bot. Free
						to use, free to inspect, and built for the community.
					</p>
					<div className="scribble bg-card p-4 rounded-md" >
						ONE
						<br />
						ORACLE
						<br />
						FOR ALL
					</div>
				</div>
			</div>
		</section>
	);
}

export function Features() {
	return (
		<section className="features section-pad" id="features">
			<div className="section-heading">
				<div>
					<div className="section-label">02 / THE ARSENAL</div>
					<h2>
						BUILT TO DO
						<br />
						<em>MORE.</em>
					</h2>
				</div>
				<p>
					Everything your server needs.
					<br />
					Nothing it doesn&apos;t.
				</p>
			</div>
			<div className="feature-grid">
				{features.map(({ icon: Icon, title, text, status, tone }, index) => (
					<article className={`feature-card card-${index + 1}`} key={title}>
						<div className="feature-top">
							<Icon />
							<span className={`status status-${tone}`}>
								<i /> {status}
							</span>
						</div>
						<div>
							<span className="feature-index">0{index + 1}</span>
							<h3>{title}</h3>
							<p>{text}</p>
						</div>
						<ChevronRight className="card-arrow" />
					</article>
				))}
			</div>
		</section>
	);
}

export function CommandsPreview() {
	return (
		<section className="commands section-pad" id="commands">
			<div className="section-heading">
				<div>
					<div className="section-label">03 / THE COMMAND LINE</div>
					<h2>
						YOUR SERVER.
						<br />
						<em>YOUR RULES.</em>
					</h2>
				</div>
				<a className="text-link" href="#commands">
					View all commands <ArrowUpRight />
				</a>
			</div>
			<div className="command-grid">
				{Object.entries(commands).map(([category, items]) => (
					<div className="terminal" key={category}>
						<div className="terminal-bar">
							<span>
								<i />
								<i />
								<i />
							</span>
							<strong>
								<Terminal /> {category.toLowerCase()}.sh
							</strong>
						</div>
						<div className="terminal-body">
							<div className="terminal-prompt">
								oracle@server:~${" "}
								<span>commands --{category.toLowerCase()}</span>
							</div>
							{items.map(([name, desc]) => (
								<div className="command-row" key={name}>
									<strong>{name}</strong>
									<span>{desc}</span>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}

export function Roadmap() {
	const phases = [
		[
			"01",
			"THE FOUNDATION",
			"Core utility, diagnostics, and the radio that never sleeps.",
			"LIVE",
			true,
		],
		[
			"02",
			"THE PLAYGROUND",
			"Roleplay, fun commands, and more ways to make noise.",
			"IN PROGRESS",
			false,
		],
		[
			"03",
			"THE FORTRESS",
			"A full security suite to protect your community.",
			"UP NEXT",
			false,
		],
	];
	return (
		<section className="roadmap section-pad" id="roadmap">
			<div className="section-label">04 / THE ROAD AHEAD</div>
			<div className="roadmap-head">
				<h2>
					THE FUTURE IS
					<br />
					<em>LOOKING SHARP.</em>
				</h2>
				<span>NO BACKPEDALING.</span>
			</div>
			<div className="timeline">
				{phases.map(([num, title, text, status, live], index) => (
					<div className={`phase ${live ? "phase-live" : ""}`} key={num}>
						<div className="phase-marker">
							<span>{num}</span>
							<i />
						</div>
						<div className="phase-status">{status}</div>
						<h3>{title}</h3>
						<p>{text}</p>
						{index < 2 && <div className="phase-line" />}
					</div>
				))}
			</div>
		</section>
	);
}

export function OpenSource() {
	return (
		<section className="open-source section-pad">
			<div className="open-source-inner">
				<div className="giant-star">✦</div>
				<div>
					<div className="section-label">05 / YOUR MOVE</div>
					<h2>
						HELP US MAKE
						<br />
						<em>ORACLE LOUDER.</em>
					</h2>
					<p>
						Oracle is built in the open. Bring an idea, fix a bug, or just come
						hang out. The next commit could be yours.
					</p>
					<a
						className="button button-light"
						href="https://github.com/emanueletocci/oracle_bot"
						target="_blank"
						rel="noreferrer"
					>
						<Code2 /> Contribute on GitHub <ArrowUpRight />
					</a>
				</div>
				<div className="open-source-stamp">
					OPEN
					<br />
					<span>SOURCE</span>
				</div>
			</div>
		</section>
	);
}

export function Footer() {
	return (
		<footer className="footer section-pad">
			<Logo />
			<div className="footer-links">
				<a href="#features">Features</a>
				<a href="#commands">Commands</a>
				<a href="#roadmap">Roadmap</a>
				<a href="https://github.com/emanueletocci/oracle_bot" target="_blank" rel="noreferrer">
					GitHub <ArrowUpRight />
				</a>
			</div>
			<div className="footer-bottom">
				<span>© 2026 ORACLE PROJECT</span>
				<span>OPEN SOURCE PROJECT · MADE FOR DISCORD</span>
			</div>
		</footer>
	);
}

export default function Page() {
	return (
		<main>
			<Navbar />
			<Hero />
			<Mission />
			<Features />
			<CommandsPreview />
			<Roadmap />
			<OpenSource />
			<Footer />
		</main>
	);
}
