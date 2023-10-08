import { ChannelType } from "@prisma/client";
import { redirect } from "next/navigation";

import { currentProfile } from "@/lib/current-profile";
import { db } from "@/lib/db";

import { ServerHeader } from "./server-header";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";

interface ServerSidebarProps {
  serverId: string;
}

export const ServerSidebar = async ({ serverId }: ServerSidebarProps) => {
  const profile = await currentProfile();

  if (!profile) {
    return redirect("/");
  }

  const server = await db.server.findUnique({
    where: {
      id: serverId,
    },
    include: {
      channels: {
        orderBy: {
          cretaedAt: "asc"
        }
      },
      members: {
        include: {
          profile: true
        },
        orderBy: {
          role: "asc"
        }
      }
    }
  });

  const textChannels = server?.channels.filter((chanel) => chanel.type === ChannelType.TEXT);
  const audioChannels = server?.channels.filter((chanel) => chanel.type === ChannelType.AUDIO);
  const videoChannels = server?.channels.filter((chanel) => chanel.type === ChannelType.VIDEO);

  const members = server?.members.filter((member) => member.profileId !== profile.id)

  if (!server) {
    return redirect("/");
  }

  const role = server.members.find((member) => member.profileId === profile.id)?.role;

  return (
    <div
      className="flex flex-col h-full w-full text-primary dark:bg-[#2B2D31] bg-[#F2F3F5]"
    >
      <ServerHeader
        server={server}
        role={role}
      />
      <ScrollArea className="flex-1 px-3">
        <div className="mt-2">
          search channel
        </div>
        <Separator className="bg-zinc-200 dark:bg-zinc-700 rounded-md my-2" />
        {textChannels?.length && (
          <div className="mb-2">
            <div>
              <p>Text Channels</p>

            </div>
            {textChannels.map((channel) => (
              <div key={channel.id}>
                <p>{channel.name}</p>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}