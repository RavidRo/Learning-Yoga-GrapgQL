import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLYogaError } from '@graphql-yoga/node';
import { Comment, Link } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { GraphQLContext } from './context';

const typeDefinitions = /* GraphQL */ `
	type Query {
		info: String!
		feed: [Link!]!
		comment(id: ID!): Comment
		link(id: ID!): Link
	}

	type Mutation {
		postLink(url: String!, description: String!): Link!
		postCommentOnLink(linkId: ID!, body: String!): Comment!
	}

	type Link {
		id: ID!
		description: String!
		url: String!
		comments: [Comment!]!
	}

	type Comment {
		id: ID!
		body: String!
		link: Link
	}
`;

const parseIntSafe = (value: string): number | null => {
	if (/^(\d+)$/.test(value)) {
		return parseInt(value, 10);
	}
	return null;
};

const resolvers = {
	Link: {
		comments: (parent: Link, _args: {}, context: GraphQLContext) =>
			context.prisma.comment.findMany({ where: { link: { id: parent.id } } }),
	},

	Comment: {
		link: (parent: Comment, _args: {}, context: GraphQLContext) =>
			parent.linkId ? context.prisma.link.findFirst({ where: { id: parent.linkId } }) : null,
	},

	Query: {
		info: () => 'This is the API of Hacker News Clone',
		feed: (_parent: unknown, _args: {}, context: GraphQLContext) =>
			context.prisma.link.findMany(),
		comment: (_parent: unknown, args: { id: string }, context: GraphQLContext) =>
			context.prisma.comment.findFirst({ where: { id: parseInt(args.id) } }),
		link: (_parent: unknown, args: { id: string }, context: GraphQLContext) =>
			context.prisma.link.findFirst({ where: { id: parseInt(args.id) } }),
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
		postCommentOnLink: async (
			_parent: unknown,
			args: { linkId: string; body: string },
			context: GraphQLContext
		) => {
			const linkId = parseIntSafe(args.linkId);
			if (linkId === null) {
				return Promise.reject(
					new GraphQLYogaError(
						`Cannot post comment on non-existing link with id ${args.linkId}`
					)
				);
			}

			const newComment = await context.prisma.comment
				.create({
					data: {
						body: args.body,
						linkId,
					},
				})
				.catch((err) => {
					if (err instanceof PrismaClientKnownRequestError && err.code === 'P2003') {
						return Promise.reject(
							new GraphQLYogaError(
								`Cannot post comment on none-existing link with id ${args.linkId}.`
							)
						);
					}
					return Promise.reject(err);
				});

			return newComment;
		},
	},
};

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
});
