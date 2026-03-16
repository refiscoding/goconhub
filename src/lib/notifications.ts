import { prisma } from "@/lib/prisma";

export async function createNotification(params: {
  userId:  string;
  type:    string;
  title:   string;
  body:    string;
  linkUrl?: string;
}) {
  return prisma.notification.create({ data: params });
}
