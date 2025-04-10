/**
 * Test script to check if duplicate sections are removed from chatbot responses
 *
 * This script simulates the formatting that happens in the formatResponse function
 * to verify that duplicates are being properly detected and removed.
 */

// Mock response with duplicate sections
const mockResponseWithDuplicates = `**Information**
- Broken arms typically cause severe pain, swelling, and visible deformity
- You may experience limited movement or a grating sensation
- The injured area may appear bruised or discolored

**Recommendations**
- Immobilize the injured arm using a sling or splint
- Apply ice wrapped in a cloth to reduce swelling
- Take over-the-counter pain medication

**Information**
- The same information appears again
- This is a duplicate section that should be removed
- It has the same header as the first section

**Medical Disclaimer**
- This information is for general guidance only
- Not a substitute for professional medical advice
- Consult your healthcare provider for specific advice

**Recommendations**
- This is a duplicate recommendations section
- It should also be removed to avoid confusing the user
`;

// Function to detect and remove duplicate sections
function removeDuplicateSections(text) {
  console.log("Original response with duplicates:");
  console.log(text);
  console.log("------------------------");

  // Split into sections
  const sections = text.split("**").filter((section) => section.trim());

  // Track which section headers we've seen
  const seenHeaders = new Set();
  const uniqueSections = [];

  // Keep only unique sections
  for (let i = 0; i < sections.length; i += 2) {
    // Even indexes are headers, odd indexes are content
    const header = sections[i]?.trim();
    const content = sections[i + 1];

    // Skip duplicate headers
    if (header && !seenHeaders.has(header)) {
      seenHeaders.add(header);
      uniqueSections.push(`**${header}**`);
      if (content) {
        uniqueSections.push(content);
      }
    }
  }

  // Reassemble the text
  const dedupedText = uniqueSections.join("\n");

  console.log("Response after removing duplicates:");
  console.log(dedupedText);
  console.log("------------------------");

  // Count sections in original vs. deduped
  const originalSectionCount = text.match(/\*\*([^*]+)\*\*/g)?.length || 0;
  const dedupedSectionCount =
    dedupedText.match(/\*\*([^*]+)\*\*/g)?.length || 0;

  console.log(`Original section count: ${originalSectionCount}`);
  console.log(`Deduped section count: ${dedupedSectionCount}`);

  return dedupedText;
}

// Run the test
removeDuplicateSections(mockResponseWithDuplicates);

// Log conclusion
console.log("Test completed. If duplicate sections are successfully removed,");
console.log(
  "the deduped section count should be less than the original section count."
);
