import { ActionFunction, json } from 'remix';
import { extractIntFromFormData } from '~/lib/helpers.server';
import { ensureAuthenticated } from '~/lib/middleware.server';
import { prisma } from '~/lib/prisma.server';

/*
 * Remove a label from a track.
 *
 * Parameters:
 *   labelId: number  The id of the label to remove from the track
 *   trackId: number  The id of the track to remove the label from
 */
export const action: ActionFunction = async ({ request }) => {
  const userId = await ensureAuthenticated(request);

  // Extract the labelId and trackId from the form
  const formData = await request.formData();
  const labelId = extractIntFromFormData(formData, 'labelId');
  const trackId = extractIntFromFormData(formData, 'trackId');

  const track = await prisma.track.findUnique({
    where: { id: trackId },
    select: { userId: true },
  });
  if (!track || track.userId !== userId) {
    // Even if the track exists, do not leak that information to the user if they do not own the track
    throw new Response('Error updating non-existent track', {
      status: 404,
    });
  }

  // Remove the link from the track to the label
  await prisma.track.update({
    where: { id: trackId },
    data: {
      labels: {
        disconnect: [{ id: labelId }],
      },
    },
  });

  return json({ success: true });
};
