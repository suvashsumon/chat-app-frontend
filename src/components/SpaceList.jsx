import React from 'react';
import { Link } from 'react-router-dom';

const SpaceList = ({ spaces }) => {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-neutral-800 dark:text-neutral-200">Your Spaces</h2>
      {spaces.length === 0 ? (
        <p className="text-neutral-600 dark:text-neutral-400">No spaces yet. Create one to start chatting!</p>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {spaces.map((space) => (
            <li key={space.id} className="bg-white dark:bg-neutral-800 p-5 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700 hover:shadow-lg transition-shadow duration-200">
              <Link to={`/space/${space.id}`} className="text-xl font-medium text-primary-600 dark:text-primary-400 hover:underline">
                {space.name}
              </Link>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Created by: {space.creator_display_name}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SpaceList;
