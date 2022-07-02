import { makeExecutableSchema } from '@graphql-tools/schema';

const typeDefinitions = /* GraphQL */ `
	type Query {
		info: String!
		feed: [Link!]!
	}

	type Link {
		id: ID!
		description: String!
		url: String!
	}
`;

const resolvers = {
	Query: {
		info: () => 'This is the API of Hacker News Clone',
		feed: () => links,
	},

	Link: {
		id: (link: Link) => link.id,
		description: (link: Link) => link.description,
		url: (link: Link) => link.url,
	},
};

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
});

// ********* Dummy Data *********
type Link = {
	id: string;
	description: string;
	url: string;
};

const links: Link[] = [
	{
		id: 'link-0',
		url: 'https://graphql-yoga.com',
		description: 'The easiest way of setting up a GraphQL server',
	},
];
