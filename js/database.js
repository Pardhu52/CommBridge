// database.js
import { database } from './firebase-config.js';
import {
  ref,
  set,
  get,
  push,
  update,
  onValue
} from 'https://www.gstatic.com/firebasejs/9.21.0/firebase-database.js';

// Add new issue
export async function addIssue(issueData) {
  try {
    const issuesRef = ref(database, 'issues');
    const newIssueRef = push(issuesRef);
    await set(newIssueRef, issueData);
    console.log('Issue added with ID:', newIssueRef.key);
    return newIssueRef.key;
  } catch (error) {
    console.error('Error adding issue:', error.message);
    throw error;
  }
}

// Fetch all issues
export function subscribeToIssues(callback) {
  const issuesRef = ref(database, 'issues');
  onValue(issuesRef, snapshot => {
    const issues = snapshot.val();
    callback(issues);
  });
}

// Update issue status
export async function updateIssueStatus(issueId, status) {
  try {
    const issueRef = ref(database, `issues/${issueId}`);
    await update(issueRef, { status });
    console.log('Issue status updated');
  } catch (error) {
    console.error('Error updating issue status:', error.message);
    throw error;
  }
}
