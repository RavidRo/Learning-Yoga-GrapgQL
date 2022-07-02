import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLContext } from './context';

const typeDefinitions = /* GraphQL */ `
	type Query {
		info: String!
		feed: [Link!]!
	}

	type Mutation {
		postLink(url: String!, description: String!): Link!
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
		feed: (_parent: unknown, _args: {}, context: GraphQLContext) =>
			context.prisma.link.findMany(),
	},

	Mutation: {
		postLink: async (
			_parent: unknown,
			args: { description: string; url: string },
			context: GraphQLContext
		) => {
			const link = await context.prisma.link.create({
				data: {
					description: args.description,
					url: args.url,
				},
			});

			return link;
		},
	},
};

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
});
