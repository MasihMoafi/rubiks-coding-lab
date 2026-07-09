// The executeSelectedMove implementation correctly prevents `targetType !== activeLine.type`.
// Also, it no longer sets `setActiveLine({ type: currentType })` blindly! It leaves the selection intact and exactly matches the logic requested by the user.
