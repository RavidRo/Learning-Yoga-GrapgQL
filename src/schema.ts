import { makeExecutableSchema } from '@graphql-tools/schema';
import { Comment, Link } from '@prisma/client';
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
			const newComment = await context.prisma.comment.create({
				data: {
					body: args.body,
					linkId: parseInt(args.linkId),
				},
			});

			return newComment;
		},
	},
};

export const schema = makeExecutableSchema({
	resolvers: [resolvers],
	typeDefs: [typeDefinitions],
});
