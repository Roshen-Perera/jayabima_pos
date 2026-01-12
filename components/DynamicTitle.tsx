import React from 'react'

const DynamicTitle = () => {
  return (
    <div>
      <h1 className="text-base font-medium">
        {navItems.find((item) => item.url === pathname)?.title || "Dashboard"}
      </h1>
    </div>
  );
}

export default DynamicTitle
