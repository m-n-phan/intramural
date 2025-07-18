CREATE TABLE "conversations" (
"id" serial PRIMARY KEY NOT NULL,
"team_id" integer,
"type" varchar(10) NOT NULL, -- 'dm' or 'team'
"created_at" timestamp DEFAULT now(),
"updated_at" timestamp DEFAULT now(),
CONSTRAINT "conversations_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE "conversation_participants" (
"id" serial PRIMARY KEY NOT NULL,
"conversation_id" integer NOT NULL,
"user_id" varchar NOT NULL,
"joined_at" timestamp DEFAULT now(),
CONSTRAINT "conversation_participants_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action,
CONSTRAINT "conversation_participants_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);

CREATE TABLE "messages" (
"id" serial PRIMARY KEY NOT NULL,
"conversation_id" integer NOT NULL,
"sender_id" varchar NOT NULL,
"content" text NOT NULL,
"created_at" timestamp DEFAULT now(),
CONSTRAINT "messages_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."conversations"("id") ON DELETE cascade ON UPDATE no action,
CONSTRAINT "messages_sender_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action
);

CREATE INDEX "conversation_id_idx" ON "messages" ("conversation_id");
CREATE INDEX "sender_id_idx" ON "messages" ("sender_id");
