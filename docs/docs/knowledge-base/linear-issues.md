---
sidebar_position: 6
---

# Linear

You can quickly import the issues and projects from **Linear** application directly to CrawlChat as a source. It also fetches the projects and its summary, description, and updates from the project. You need to create an API Key on Linear application for it to work. Following is how you can do it.

![Linear Page Group](./images/linear-group.png)

## API Key

You need to create an API Key from the **Linear** dashboard to make it work. Follow the steps to make one

1. Login to your Linear account
2. Go to Settings of your workspace

![Linear workspace settings menu](./images/linear-settings.png)

3. Go to **Security & access**

![Linear Security & access](./images/linear-security-and-access.png)

4. Click **New token** under **Personal API keys**
5. Give **Key name** as _CrawlChat_
6. Select _Only select permissions_ under **Permissions**
7. Check only _Read_
8. Select _All teams you have access to_
9. Click **Create**
10. Copy the created **API Key**

## Create group

Go to [New Group](https://crawlchat.app/knowledge/group) page to create and import your **Linear** issues to CrawlChat knowledge base. Select Linear type and fill the form, you will have to provide the **API Token** generated in above steps.

Once you create the group, you can turn on the **auto update** feature for the group by selected the update frequency.

## Skip by statuses

You can configures the statuses of **Issues** and **Projects** to be skipped. This helps you in fetching only relevant information to CrawlChat and keeping the knowledge base clean.

## Constraints

Linear has a rate limit of **1500** requests per hour. To make sure the CrawlChat never breaches these limits, it is required to apply following constraints for a smooth integration.

1. CrawlChat fetches a max of **250** _issues_ + a max of **250** _projects_
2. They are sorted by updated date. So, it fetches the last updated **250** _issues_ and _projects_ (max)
3. This makes sure that it never breaches the Linear rate limit of **1500** requests per hour
4. Setting up the _Auto update_ on this group, for example every _day_ or _week_, makes it always update or add the latest **250** (updated) issues and projects and over time it would have all the issues and projects
5. Remember, whenever it fetches, it does not remove old issues/projects. It just updates existing ones or adds new ones.
